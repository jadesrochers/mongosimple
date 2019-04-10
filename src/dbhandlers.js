const MongoClient = require('mongodb').MongoClient
const R = require('ramda')

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

exports.mongoClient = mongoClient
exports.Db = Db
exports.command = command
exports.closeConnect = closeConnect

exports.collection = collection
