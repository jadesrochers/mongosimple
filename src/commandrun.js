const R = require('ramda')
const fps = require('@jadesrochers/fpstreamline');
const cc = require('./commandcreate');

const hasData = R.pipe(
  R.path(['cursor','firstBatch']),
  R.length,
  R.lt(0),
)

const getDistinct = R.curry((exeCommand,collection,field,query={}) => 
  fps.pipeAsync(
    cc.distinctCommand(collection,field),
    exeCommand,
  )(query)
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

const findFromDb = R.curry((exeCommand,collection,filter,optional={}) => {
  return fps.pipeAsync(
    cc.findCommand(collection, filter),
    exeCommand,
  )(optional)
})

exports.hasData = hasData
exports.getDistinct = getDistinct
exports.createIndex = createIndex
exports.dropIndex = dropIndex
exports.checkExists = checkExists
exports.insertIntoDb = insertIntoDb
exports.findFromDb = findFromDb

