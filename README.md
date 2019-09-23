# Mongosimple
Wraps various MongoClient functionality to make interacting with mongodb  
simple for common uses.
It does not provide all possible functionality.

## Whats the Use?
The goal is just to be as very simple and straightforward to use,  
not to provide all functionality possible.  
It does not do schemas, for example.

## installation 
npm install @jadesrochers/mongosimple  
const mongos = require('@jadesrochers/mongosimple')  

## Usage
Get the connection to the db. Need to pass an object with a valid URL
and database name.

### The commands available - 
##### Get a database connection -  
The settings must include url for mongodb and a database name.
dbconn = await mongos.mongoMaker(settings);
##### Insert data -  
There is only an insertMany command, but it works fine for single  
inserts too.
await dbconn.insertMany('testcoll')([{_id: 1, a: 1, b: 2, c: 5},{_id: 2, a: 1, b: 4, c: 11}])
##### Delete data -  
Also only deleteMany; it can delete nothing or everything depending  
on the passed object.
await dbconn.deleteMany('testcoll',{}) 
##### Insert an index -
Once again, it is createIndexes plural, but you can do a single  
index as well.
Pass the collection as first arg, then the index objects.
```javascript
let aIndex = {
  key: {_id: 1, 'a':1 },
  name: 'afind'
}
let bIndex = {
  key: {_id: 1, 'b':1 },
  name: 'bfind'
}
```
await dbconn.createIndexes('testcoll')([aIndex, bIndex])
##### Delete an index -  
This is not a multi-command, have to delete one at a time.  
await dbconn.dropIndex('test')('afind')
await dbconn.dropIndex('test')('bfind')
##### Find data -  
Takes two objects, the search and then options. All the options  
available in mongodb (projection, limit, min, max ...)  
are available in the option object.
```javascript
let cursor = await dbconn.find('testcoll')({a: 1})
let cursor1 = await dbconn.find('testcoll')({a: 1},{'projection':{b: 1}, limit: 1})
let cursor2 = await dbconn.find('testcoll')({a: 1},{'projection':{b: 1}, limit: 1, min: {_id:1, b:3}})
```
#####  Use an aggregation pipeline -
Pass the collection and the aggregation pipeline array.  
```javascript
let aggcursor = await dbconn.aggregate('testcoll')([
  {$match: {a: 1}},
  {$limit: 1},
  {$project: {b:1}}]
)
```


#### Setting up a test db to run commands live -  
This uses a docker-compose to set up a database to demonstrate  
how the library works.  
**mongo-compose.yml:**  
```yaml
version: "3"
services:
  mongodb:
    container_name: mongotest
    image: mongo:4.2-bionic
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: test
      MONGO_INITDB_ROOT_PASSWORD: test
    ports:
      - 27018:27018
    command: mongod --auth --port 27018
```
**Bring up the mongodb testing instance -**  
docker-compose -f mongo-compose.yml up -d

#### Setup the connection settings -  
```javascript
const mongos = require('@jadesrochers/mongosimple')  
let urldb = `mongodb://test:test@localhost:27018/admin?authMechanism=SCRAM-SHA-1&authSource=admin`
let database = "testdb"
let settings = Object.assign({}, {urldb: urldb}, {database: database})
let dbconn
```

#### Do connect, set up and tear down of data each time -   
```javascript
async function setupConn(){
  dbconn = await mongos.mongoMaker(settings);
  await dbconn.insertMany('testcoll')([{_id: 1, a: 1, b: 2, c: 5},{_id: 2, a: 1, b: 4, c: 11}])
  await dbconn.insertMany('testcoll')({_id: 3, d: 'singleinsert'})

}
async function teardownConn(){
  await dbconn.deleteMany('testcoll',{}) 
  if (dbconn) dbconn.closeConnect();
}

```

#### Insert some indices, then get them -  
```javascript
let aIndex = {
  key: {_id: 1, 'a':1 },
  name: 'afind'
}
let bIndex = {
  key: {_id: 1, 'b':1 },
  name: 'bfind'
}

let createindices = async () => {
    await setupConn()
    await dbconn.createIndexes('testcoll')([aIndex, bIndex])
    let idxs = await dbconn.indexes('testcoll')
    console.log('Indexes inserted: ', idxs)
    await teardownConn()
}
createindices()
```


#### Find with some options and outputs -
```javascript
let find = async () => {
  await setupConn()

  let cursor = await dbconn.find('testcoll')({a: 1})
  let rsltarr = await cursor.toArray()
  console.log('find 1 - ',rsltarr) 

  let cursor1 = await dbconn.find('testcoll')({a: 1},{'projection':{b: 1}, limit: 1})
  let rsltarr1 = await cursor1.toArray()
  console.log('find 2 - ',rsltarr1) 

  let cursor2 = await dbconn.find('testcoll')({a: 1},{'projection':{b: 1}, limit: 1, min: {_id:1, b:3}})
  let rsltarr2 = await cursor2.toArray()
  console.log('find 3 - ',rsltarr2) 

  let cursor3 = await dbconn.find('testcoll')({a: 1},{'sort':{b: -1}})
  let rsltarr3 = await cursor3.toArray()
  console.log('find 4 - ',rsltarr3) 
  await teardownConn()
}
find()
```

#### Delete data
```javascript
let deleteMany = async () => {

    await setupConn()
    let rslt = await dbconn.deleteMany('testcoll')({$or: [{b: 4}, {d: 'singleinsert'}] } )

    let cursor = await dbconn.find('testcoll')({})
    let rsltarr = await cursor.toArray()
    console.log('Data after delete: ', rsltarr)
    await teardownConn()
}
deleteMany()
```

#### Use an Aggregate pipeline
```javascript
let aggregation = async () => {
    await setupConn()
    let aggcursor = await dbconn.aggregate('testcoll')([
      {$match: {a: 1}},
      {$limit: 1},
      {$project: {b:1}}]
    )
    var rsltarr = await aggcursor.toArray()
    console.log('Aggregation result: ', rsltarr)
    await teardownConn()
}
aggregation()
```

#### Drop Index
```javascript
let dropIndex = async () => {
    await dbconn.createIndexes('testcoll')([aIndex, bIndex])
    let idxs = await dbconn.indexes('testcoll')
    console.log('Indexes inserted: ', idxs)
    await dbconn.dropIndex('testcoll')('afind')
    await dbconn.dropIndex('testcoll')('bfind')
    idxs = await dbconn.indexes('testcoll')
    console.log('Indexes after drop: ', idxs)
    await teardownConn()
}
dropIndex()
```

