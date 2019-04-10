const MongoClient = require('mongodb').MongoClient
const R = require('ramda')
const fps = require('@jadesrochers/fpstreamline')

const mongoClient = R.curry(async(url, options={}) => {
  var mgclient = await MongoClient.connect(url, { useNewUrlParser: true })
  return mgclient
})

const closeConnect = mongoclient => async () => {
  await mongoclient.close()
}

const Db = R.curry(async(mongoClient, dbname, options={}) => {
  var db = await mongoClient.db(dbname)
  return db
})

const command = R.curry(async (Db,rawcommand) => {
  var rslt = await Db.command(rawcommand)
  return rslt
})

const collection = R.curry(async (Db, collName, options={}) => {
 var collection = await Db.collection(collName, options)
 return collection
})



const find = R.curry(async (collection, collname, query, findoptions={}, colloptions={}) => {
 var cursor = await collection(collname, colloptions).find(query, findoptions)
 return cursor
})

const findOne = R.curry(async (collection, collname, query, findoptions={}, colloptions={}) => {
 var cursor = await collection(collname, colloptions).findOne(query, findoptions)
 return cursor
})

const insertMany = R.curry(async (collection, collname, docs, insertoptions={}, colloptions={}) => {
 docs = fps.toArray(docs)
 var rslt = await collection(collname, colloptions).insertMany(query, insertoptions)
 return rslt
})

const deleteMany = R.curry(async (collection, collname, filter, deleteoptions={}, colloptions={}) => {
 var rslt = await collection(collname, colloptions).deleteMany(filter, deleteoptions)
 return rslt
})

const createIndexes = R.curry(async (collection, collname, indexes, indexoptions={}, colloptions={}) => {
 indexes = fps.toArray(indexes)
 var rslt = await collection(collname, colloptions).createIndexes(indexes, indexoptions)
 return rslt
})

const dropIndex = R.curry(async (collection, collname, name, indexoptions={}, colloptions={}) => {
 var rslt = await collection(collname, colloptions).dropIndex(name, indexoptions)
 return rslt
})


exports.mongoClient = mongoClient
exports.Db = Db
exports.command = command
exports.closeConnect = closeConnect

exports.collection = collection
exports.find = find
