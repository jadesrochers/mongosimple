var { MongoMemoryServer } = require('mongodb-memory-server')
/* const MongoClient = require('mongodb').MongoClient */
const mongotools = require('./mongotools')

let dbconn, mongoServer;
let settings = {};

async function setupMemDb(){
  mongoServer = new MongoMemoryServer();
  settings.urldb = await mongoServer.getConnectionString();
  settings.database = await mongoServer.getDbName();
  dbconn = await mongotools.mongoMaker(settings);
}
async function teardownMemDb(){
  if (dbconn) dbconn.closeConnect();
  if (mongoServer) mongoServer.stop();
}

describe('Set up and Tear down', () => {
  beforeEach(async () => {
    await setupMemDb()
  });

  afterEach( async () => {
    await teardownMemDb()
  });

  test('Successful creation of client', async () => {
    expect(dbconn.dbCommand).toBeDefined();
    await dbconn.closeConnect()
    await expect(dbconn.findFromDb('test',{a: 1})).rejects.toThrow(/topology was destroyed/)
  })

})

describe('Inserts, Index, Find', () => {
  beforeAll(async () => {
    await setupMemDb()
  });

  beforeAll(async () => {
    await dbconn.insertIntoDb('test')([{_id: 1, a: 1, b: 2, c: 5},{_id: 2, a: 1, b: 4, c: 11}])
    await dbconn.insertIntoDb('test')({_id: 3, d: 'singleinsert'})
    var aIndex = {
      key: {_id: 1, 'a':1 },
      name: 'afind'
    }
    var bIndex = {
      key: {_id: 1, 'b':1 },
      name: 'bfind'
    }
    await dbconn.createIndex('test')([aIndex, bIndex])
  })

  test('Integration; getDistinct/distinctCommand', async () => {
    var data = await dbconn.getDistinct('test', 'b')
    expect(data.values).toEqual([2,4])
  })

  test('Integration; dbCommand, insertCommand/insertIntoDb and findCommand/findFromDb', async () => {
    var data = await dbconn.findFromDb('test', {a: 1})
    expect(data.cursor.firstBatch).toEqual([{_id: 1, a: 1, b: 2, c: 5},{_id: 2, a: 1, b: 4, c: 11}])
    // The input ({b: 1}) is project arg to get only that member in output.
    var dataproject = await dbconn.findFromDb('test')({a: 1},{'projection':{b: 1}})
    expect(dataproject.cursor.firstBatch).toEqual([{_id:1, b: 2},{_id: 2, b: 4}])
    // test projection and limit together
    var dataproject = await dbconn.findFromDb('test')({a: 1},{'projection':{b: 1}, limit: 1})
    expect(dataproject.cursor.firstBatch).toEqual([{_id:1, b: 2}])
    // min/max only work with an index; all values in index must be used.
    var dataproject = await dbconn.findFromDb('test')({a: 1},{'projection':{b: 1}, limit: 1, min: {_id:1, b:3}})
    expect(dataproject.cursor.firstBatch).toEqual([{_id: 2, b: 4}])
    // sort in reverse numeric
    var data = await dbconn.findFromDb('test', {a: 1},{'sort':{b: -1}})
    expect(data.cursor.firstBatch).toEqual([{_id: 2, a: 1, b: 4, c: 11},{_id: 1, a: 1, b: 2, c: 5}])
    // Skip one result
    var data = await dbconn.findFromDb('test', {a: 1},{'skip':1})
    expect(data.cursor.firstBatch).toEqual([{_id: 2, a: 1, b: 4, c: 11}])

  })

  test('Integration; insertCommand/insertIntoDb and checkExists/findCommand/hasData', async () => {
    var data = expect(await dbconn.checkExists('test')({c: 11})).toBe(true)
    var data = await dbconn.checkExists('test')({b: 2})
    expect(data).toBe(true)
    var data = await dbconn.checkExists('test')({a: 2})
    expect(data).toBe(false)
  })

  test('Integration IndexCommand and createIndex, dbCommand', async () => {
    var idxs = await dbconn.dbclient.collection('test').indexes()
    idxs = idxs.map(n => n.name)
    expect(idxs).toEqual(['_id_','afind','bfind'])
  })

  test('Integration dropIndexCommand and dropIndex, dbCommand', async () => {
    await dbconn.dropIndex('test')('afind')
    await dbconn.dropIndex('test')('bfind')
    var idxs = await dbconn.dbclient.collection('test').indexes()
    idxs = idxs.map(n => n.name)
    expect(idxs).toEqual(['_id_'])
  })

  afterAll( async () => {
    await teardownMemDb()
  });


})

