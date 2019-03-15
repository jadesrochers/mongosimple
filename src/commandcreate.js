const F = require('lodash/fp')
const R = require('ramda')

// Create find&filter command to look for something in the db
const findCommand = collection => filter => {
  return R.pipe(
    F.set('find')(collection),
    F.set('filter')(filter),
  )({})
}

// Create a command to insert data
const insertCommand = collection => documents => {
  documents = F.castArray(documents)
  return R.pipe(
    F.set('insert')(collection),
    F.set('documents')(documents),
  )({})
}

const indexCommand = collection => indices => {
  indicesarr = F.castArray(indices)
  return R.pipe(
    F.set('createIndexes')(collection),
    F.set('indexes')(indicesarr),
  )({})
}

// Seems only one index can be dropped at a time. Or all.
const dropIndexCommand = collection => name => {
  return R.pipe(
    F.set('dropIndexes')(collection),
    F.set('index')(name),
  )({})
}

exports.findCommand = findCommand
exports.insertCommand = insertCommand
exports.indexCommand = indexCommand
exports.dropIndexCommand = dropIndexCommand
