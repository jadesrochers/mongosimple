const R = require('ramda')
const checkset = require('@jadesrochers/checksettings')
const commrun = require('./src/commandrun')
const commcreate = require('./src/commandcreate')
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
    {command: command},
    {getDistinct: commrun.getDistinct(command)},
    {createIndex: commrun.createIndex(command)},
    {dropIndex: commrun.dropIndex(command)},
    {checkExists: commrun.checkExists(command)},
    {insertIntoDb: commrun.insertIntoDb(command)},
    {findFromDb: commrun.findFromDb(command)},
    {closeConnect: db.closeConnect(mongoClient)},
    {Db: Db},
  )
}

exports.mongoMaker = mongoMaker
exports.findCommand = commcreate.findCommand
exports.insertCommand = commcreate.insertCommand
exports.indexCommand = commcreate.indexCommand
exports.dropIndexCommand = commcreate.dropIndexCommand
exports.hasData = commrun.hasData
