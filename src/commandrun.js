const R = require('ramda')
const fps = require('@jadesrochers/fpstreamline');
const cc = require('./commandcreate');

const hasData = R.pipe(
  R.path(['cursor','firstBatch']),
  R.length,
  R.lt(0),
)

const createIndex = R.curry((exeCommand,collection,index) => 
  fps.pipeAsync(
    cc.indexCommand(collection),
    exeCommand,
  )(index)
)

const dropIndex = R.curry((exeCommand,collection,name) => 
  fps.pipeAsync(
    cc.dropIndexCommand(collection),
    exeCommand,
  )(name)
)

const checkExists = R.curry((exeCommand,collection,documents) => 
  fps.pipeAsync(
    cc.findCommand(collection, documents),
    exeCommand,
    hasData,
  )()
)

const insertIntoDb = R.curry((exeCommand,collection,documents) => 
  fps.pipeAsync(
    cc.insertCommand(collection),
    exeCommand,
  )(documents)
)

const findFromDb = R.curry((exeCommand,collection,documents,project={}) => {
  return fps.pipeAsync(
    /* cc.findCommand(collection, documents, project), */
    cc.findCommand(collection, documents),
    exeCommand,
    R.path(['cursor','firstBatch']),
  )(project)
})

exports.hasData = hasData
exports.createIndex = createIndex
exports.dropIndex = dropIndex
exports.checkExists = checkExists
exports.insertIntoDb = insertIntoDb
exports.findFromDb = findFromDb
