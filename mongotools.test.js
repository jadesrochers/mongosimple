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

  test('Integration; dbCommand, insertCommand/insertIntoDb and findCommand/findFromDb', async () => {
    var data = await dbconn.findFromDb('test', {a: 1})
    expect(data).toEqual([{_id: 1, a: 1, b: 2, c: 5},{_id: 2, a: 1, b: 4, c: 11}])
    // The input ({b: 1}) is project arg to get only that member in output.
    var dataproject = await dbconn.findFromDb('test')({a: 1}, {b: 1})
    expect(dataproject).toEqual([{_id:1, b: 2},{_id: 2, b: 4}])
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

