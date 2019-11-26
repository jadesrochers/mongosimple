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

describe('Insert, Index, Find, Update, Aggregate', () => {
  beforeAll(async () => {
    await setupMemDb()
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

  beforeEach(async () => {
    await dbconn.insertMany('test')([{_id: 1, a: 1, b: 2, c: 5},{_id: 2, a: 1, b: 4, c: 11}])
    await dbconn.insertMany('test')({_id: 3, d: 'singleinsert'})
    await dbconn.updateset('test')({_id: 2}, {e: 100})
  })

  afterEach(async () => {
    await dbconn.deleteMany('test',{}) 
  })

  test('Test distinct command', async () => {
    var data = await dbconn.distinct('test', 'b')
    var dataarr = await data
    expect(dataarr).toEqual([2,4])
  })

  test('Test insert, find commands', async () => {
    var cursor = await dbconn.find('test')({a: 1})
    var rsltarr = await cursor.toArray()
    expect(rsltarr).toEqual([{_id: 1, a: 1, b: 2, c: 5},{_id: 2, a: 1, b: 4, c: 11, e: 100}])

    var cursor = await dbconn.find('test')({a: 1},{'projection':{b: 1}, limit: 1})
    var rsltarr = await cursor.toArray()
    expect(rsltarr).toEqual([{_id:1, b: 2}])

    var cursor = await dbconn.find('test')({a: 1},{'projection':{b: 1}, limit: 1, min: {_id:1, b:3}})
    var rsltarr = await cursor.toArray()
    expect(rsltarr).toEqual([{_id:2, b: 4}])

    var cursor = await dbconn.find('test')({a: 1},{'sort':{b: -1}})
    var rsltarr = await cursor.toArray()
    expect(rsltarr).toEqual([{_id: 2, a: 1, b: 4, c: 11, e: 100},{_id: 1, a: 1, b: 2, c: 5}])

  })


  test('Test deleteMany, find', async () => {
    var rslt = await dbconn.deleteMany('test')({$or: [{b: 4}, {d: 'singleinsert'}] } )

    var cursor = await dbconn.find('test')({})
    var rsltarr = await cursor.toArray()
    expect(rsltarr).toEqual([{_id: 1, a: 1, b: 2, c: 5}])

  })

  test('Test aggregate commands', async () => {
    var aggcursor = await dbconn.aggregate('test')([
     {$match: {a: 1}},
     {$limit: 1},
     {$project: {b:1}}])
    var rsltarr = await aggcursor.toArray()
    expect(rsltarr).toEqual([{_id: 1, b: 2}])

  })

  test('Test checkExists', async () => {
    var data = expect(await dbconn.checkExists('test')({c: 11})).toBe(true)
    var data = await dbconn.checkExists('test')({b: 2})
    expect(data).toBe(true)
    var data = await dbconn.checkExists('test')({a: 2})
    expect(data).toBe(false)
  })

  test('Test createIndexes, indexes', async () => {
    var idxs = await dbconn.indexes('test')
    idxs = idxs.map(n => n.name)
    expect(idxs).toEqual(['_id_','afind','bfind'])
  })

  test('Test dropIndex, indexes', async () => {
    await dbconn.dropIndex('test')('afind')
    await dbconn.dropIndex('test')('bfind')
    var idxs = await dbconn.indexes('test')
    idxs = idxs.map(n => n.name)
    expect(idxs).toEqual(['_id_'])
  })

  afterAll( async () => {
    await teardownMemDb()
  });


})

