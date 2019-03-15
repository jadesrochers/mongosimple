const F = require('lodash/fp')
const R = require('ramda')
const fps = require('@jadesrochers/fpstreamline');
const cc = require('./commandcreate');

const hasData = R.pipe(
  F.get('cursor.firstBatch'),
  R.length,
  F.lt(0),
)

const createIndex = F.curry((exeCommand,collection,index) => 
  fps.pipeAsync(
    cc.indexCommand(collection),
    exeCommand,
  )(index)
)

const dropIndex = F.curry((exeCommand,collection,name) => 
  fps.pipeAsync(
    cc.dropIndexCommand(collection),
    exeCommand,
  )(name)
)

const checkExists = F.curry((exeCommand,collection,documents) => 
  fps.pipeAsync(
    cc.findCommand(collection),
    exeCommand,
    hasData,
  )(documents)
)

const insertIntoDb = F.curry((exeCommand,collection,documents) => 
  fps.pipeAsync(
    cc.insertCommand(collection),
    exeCommand,
  )(documents)
)

const findFromDb = F.curry((exeCommand,collection,documents) => {
  return fps.pipeAsync(
    cc.findCommand(collection),
    exeCommand,
    F.get('cursor.firstBatch'),
  )(documents)
})

exports.hasData = hasData
exports.createIndex = createIndex
exports.dropIndex = dropIndex
exports.checkExists = checkExists
exports.insertIntoDb = insertIntoDb
exports.findFromDb = findFromDb
