const R = require('ramda')
const fps = require('@jadesrochers/fpstreamline')

// Create find&filter command to look for something in the db
const findCommand = R.curry((collection,filter) => (project={}) => {
  return R.pipe(
    R.assoc('find')(collection),
    R.assoc('filter')(filter),
    R.assoc('projection')(project),
  )({})
})

// Create a command to insert data
const insertCommand = R.curry((collection,documents) => {
  documents = fps.toArray(documents)
  return R.pipe(
    R.assoc('insert')(collection),
    R.assoc('documents')(documents),
  )({})
})

const indexCommand = R.curry((collection,indices) => {
  indicesarr = fps.toArray(indices)
  return R.pipe(
    R.assoc('createIndexes')(collection),
    R.assoc('indexes')(indicesarr),
  )({})
})

// Seems only one index can be dropped at a time. Or all.
const dropIndexCommand = R.curry((collection,name) => {
  return R.pipe(
    R.assoc('dropIndexes')(collection),
    R.assoc('index')(name),
  )({})
})

exports.findCommand = findCommand
exports.insertCommand = insertCommand
exports.indexCommand = indexCommand
exports.dropIndexCommand = dropIndexCommand
