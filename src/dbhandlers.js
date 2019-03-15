const MongoClient = require('mongodb').MongoClient

const mongoClient = async (url) => {
  var mgclient = await MongoClient.connect(url, { useNewUrlParser: true })
  return mgclient
}

const dbClient = async (settings) => {
  var dbclient = await settings.mgclient.db(settings.database)
  return dbclient
}

const dbCommand = dbclient => async (command) => {
  var output = await dbclient.command(command)
  return output
}

const closeConnect = mgclient => async () => {
  await mgclient.close()
}


exports.mongoClient = mongoClient
exports.dbClient = dbClient
exports.dbCommand = dbCommand
exports.closeConnect = closeConnect
