var { MongoMemoryServer } = require('mongodb-memory-server')
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
    expect(dbconn.command).toBeDefined();
    await dbconn.closeConnect()
    var rslt = await dbconn.find('test',{a: 1})
    expect(rslt.toArray()).rejects.toThrow(/Topology was destroyed/)
  })

})

describe('Inserts, Index, Find, Aggregate', () => {
  beforeAll(async () => {
    await setupMemDb()
  });

  beforeAll(async () => {
    await dbconn.insertMany('test')([{_id: 1, a: 1, b: 2, c: 5},{_id: 2, a: 1, b: 4, c: 11}])
    await dbconn.insertMany('test')({_id: 3, d: 'singleinsert'})
    var aIndex = {
      key: {_id: 1, 'a':1 },
      name: 'afind'
    }
    var bIndex = {
      key: {_id: 1, 'b':1 },
      name: 'bfind'
    }
    await dbconn.createIndexes('test')([aIndex, bIndex])
  })

  test('Integration; getDistinct/distinctCommand', async () => {
    var data = await dbconn.distinct('test', 'b')
    var dataarr = await data
    expect(dataarr).toEqual([2,4])
  })

  test('Integration; command, insertCommand/insertIntoDb and findCommand/findFromDb', async () => {
    var cursor = await dbconn.find('test')({a: 1})
    var rsltarr = await cursor.toArray()
    expect(rsltarr).toEqual([{_id: 1, a: 1, b: 2, c: 5},{_id: 2, a: 1, b: 4, c: 11}])

    var cursor = await dbconn.find('test')({a: 1},{'projection':{b: 1}})
    var rsltarr = await cursor.toArray()
    expect(rsltarr).toEqual([{_id:1, b: 2},{_id: 2, b: 4}])

    var cursor = await dbconn.find('test')({a: 1},{'projection':{b: 1}, limit: 1})
    var rsltarr = await cursor.toArray()
    expect(rsltarr).toEqual([{_id:1, b: 2}])

    var cursor = await dbconn.find('test')({a: 1},{'projection':{b: 1}, limit: 1, min: {_id:1, b:3}})
    var rsltarr = await cursor.toArray()
    expect(rsltarr).toEqual([{_id:2, b: 4}])

    var cursor = await dbconn.find('test')({a: 1},{'sort':{b: -1}})
    var rsltarr = await cursor.toArray()
    expect(rsltarr).toEqual([{_id: 2, a: 1, b: 4, c: 11},{_id: 1, a: 1, b: 2, c: 5}])

    var cursor = await dbconn.find('test')({a: 1},{'skip':1})
    var rsltarr = await cursor.toArray()
    expect(rsltarr).toEqual([{_id: 2, a: 1, b: 4, c: 11}])

    // Aggregate commands made a bit easier
    var aggcursor = await dbconn.aggregate('test')([{$match: {a: 1}},{$limit:1}, {$project: {b:1}}])
    var rsltarr = await aggcursor.toArray()
    expect(rsltarr).toEqual([{_id: 1, b: 2}])

  })

  test('Integration; insertCommand/insertIntoDb and checkExists/findCommand/hasData', async () => {
    var data = expect(await dbconn.checkExists('test')({c: 11})).toBe(true)
    var data = await dbconn.checkExists('test')({b: 2})
    expect(data).toBe(true)
    var data = await dbconn.checkExists('test')({a: 2})
    expect(data).toBe(false)
  })

  test('Integration IndexCommand and createIndex, command', async () => {
    var idxs = await dbconn.Db.collection('test').indexes()
    idxs = idxs.map(n => n.name)
    expect(idxs).toEqual(['_id_','afind','bfind'])
  })

  test('Integration dropIndexCommand and dropIndex, command', async () => {
    await dbconn.dropIndex('test')('afind')
    await dbconn.dropIndex('test')('bfind')
    var idxs = await dbconn.Db.collection('test').indexes()
    idxs = idxs.map(n => n.name)
    expect(idxs).toEqual(['_id_'])
  })

  afterAll( async () => {
    await teardownMemDb()
  });


})

