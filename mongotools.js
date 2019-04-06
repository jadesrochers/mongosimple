const R = require('ramda')
const checkset = require('@jadesrochers/checksettings')
const commrun = require('./src/commandrun')
const commcreate = require('./src/commandcreate')
const db = require('./src/dbhandlers')

const settings_required = ["urldb","database"]
const mongoMaker = async function(inSettings){
  checkset.checkSettings(settings_required)(inSettings);
  var settings = R.clone(inSettings)
  settings.mgclient = await db.mongoClient(settings.urldb);
  settings.dbclient = await db.dbClient(settings);
  const exeCommand = db.dbCommand(settings.dbclient);
  return Object.assign(
    {},
    {dbCommand: exeCommand},
    {getDistinct: commrun.getDistinct(exeCommand)},
    {createIndex: commrun.createIndex(exeCommand)},
    {dropIndex: commrun.dropIndex(exeCommand)},
    {checkExists: commrun.checkExists(exeCommand)},
    {insertIntoDb: commrun.insertIntoDb(exeCommand)},
    {findFromDb: commrun.findFromDb(exeCommand)},
    {closeConnect: db.closeConnect(settings.mgclient)},
    {dbclient: settings.dbclient},
  )
}

exports.mongoMaker = mongoMaker
exports.findCommand = commcreate.findCommand
exports.insertCommand = commcreate.insertCommand
exports.indexCommand = commcreate.indexCommand
exports.dropIndexCommand = commcreate.dropIndexCommand
exports.hasData = commrun.hasData
