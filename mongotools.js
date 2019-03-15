const MongoClient = require('mongodb').MongoClient
const F = require('lodash/fp')
const R = require('ramda')
const fps = require('@jadesrochers/fpstreamline');
const checkset = require('@jadesrochers/checksettings')
const commrun = require('./src/commandrun')
const commcreate = require('./src/commandcreate')
const db = require('./src/dbhandlers')

/* const mongoClient = async (url) => { */
/*   var mgclient = await MongoClient.connect(url, { useNewUrlParser: true }) */
/*   return mgclient */
/* } */

/* const dbClient = async (settings) => { */
/*   var dbclient = await settings.mgclient.db(settings.database) */
/*   return dbclient */
/* } */

/* const dbCommand = dbclient => async (command) => { */
/*   var output = await dbclient.command(command) */
/*   return output */
/* } */

/* const closeConnect = mgclient => async () => { */
/*   await mgclient.close() */
/* } */

/* // Create find&filter command to look for something in the db */
/* const findCommand = collection => filter => { */
/*   return R.pipe( */
/*     F.set('find')(collection), */
/*     F.set('filter')(filter), */
/*   )({}) */
/* } */

/* // Create a command to insert data */
/* const insertCommand = collection => documents => { */
/*   documents = F.castArray(documents) */
/*   return R.pipe( */
/*     F.set('insert')(collection), */
/*     F.set('documents')(documents), */
/*   )({}) */
/* } */

/* const indexCommand = collection => indices => { */
/*   indicesarr = F.castArray(indices) */
/*   return R.pipe( */
/*     F.set('createIndexes')(collection), */
/*     F.set('indexes')(indicesarr), */
/*   )({}) */
/* } */

/* // Seems only one index can be dropped at a time. Or all. */
/* const dropIndexCommand = collection => name => { */
/*   return R.pipe( */
/*     F.set('dropIndexes')(collection), */
/*     F.set('index')(name), */
/*   )({}) */
/* } */

/* const hasData = R.pipe( */
/*   F.get('cursor.firstBatch'), */
/*   R.length, */
/*   F.lt(0), */
/* ) */

/* const createIndex = F.curry((exeCommand,collection,index) => */ 
/*   fps.pipeAsync( */
/*     indexCommand(collection), */
/*     exeCommand, */
/*   )(index) */
/* ) */

/* const dropIndex = F.curry((exeCommand,collection,name) => */ 
/*   fps.pipeAsync( */
/*     dropIndexCommand(collection), */
/*     exeCommand, */
/*   )(name) */
/* ) */

/* const checkExists = F.curry((exeCommand,collection,documents) => */ 
/*   fps.pipeAsync( */
/*     findCommand(collection), */
/*     exeCommand, */
/*     hasData, */
/*   )(documents) */
/* ) */

/* const insertIntoDb = F.curry((exeCommand,collection,documents) => */ 
/*   fps.pipeAsync( */
/*     insertCommand(collection), */
/*     exeCommand, */
/*   )(documents) */
/* ) */

/* const findFromDb = F.curry((exeCommand,collection,documents) => { */
/*   return fps.pipeAsync( */
/*     findCommand(collection), */
/*     exeCommand, */
/*     F.get('cursor.firstBatch'), */
/*   )(documents) */
/* }) */

const settings_required = ["urldb","database"]
const mongoMaker = async function(inSettings){
  checkset.checkSettings(settings_required)(inSettings);
  var settings = F.cloneDeep(inSettings)
  settings.mgclient = await db.mongoClient(settings.urldb);
  settings.dbclient = await db.dbClient(settings);
  const exeCommand = await db.dbCommand(settings.dbclient);
  return Object.assign(
    {},
    {dbCommand: exeCommand},
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
