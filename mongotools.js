const R = require('ramda')
const checkset = require('@jadesrochers/checksettings')
const db = require('./src/dbhandlers')
const commands = require('./src/commands')

const settings_required = ["urldb","database"]
const mongoMaker = async function(inSettings){
  checkset.checkSettings(settings_required)(inSettings);
  var settings = R.clone(inSettings)
  var mongoClient = await db.mongoClient(settings.urldb);
  var Db = await db.Db(mongoClient, settings.database);
  var collection = await db.collection(Db);
  const command = db.command(Db);
  return Object.assign(
    {},
    {checkExists: commands.checkExists(collection)},
    {closeConnect: db.closeConnect(mongoClient)},
    {find: commands.find(collection) },
    {findOne: commands.findOne(collection) },
    {aggregate: commands.aggregate(collection) },
    {distinct: commands.distinct(collection) },
    {insertMany: commands.insertMany(collection) },
    {deleteMany: commands.deleteMany(collection) },
    {createIndexes: commands.createIndexes(collection) },
    {dropIndex: commands.dropIndex(collection) },
    {indexes: commands.indexes(collection) },
    {command: command},
    {Db: Db},
    {collection: collection},
  )
}

exports.mongoMaker = mongoMaker
