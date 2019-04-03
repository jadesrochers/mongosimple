const R = require('ramda')
const fps = require('@jadesrochers/fpstreamline')

var findOptional = ['projection','limit','sort','skip','hint','explain',
'timeout','tailable','min','max','raw','collation','partial',
'batchSize','comment','readPreference','maxtimeMS']

var validOptions = R.curry((possibleOptions,optional) => R.pipe(
  R.keys,
  R.intersection(possibleOptions),
  R.flip(R.pick)(optional)
)(optional))

// Create find&filter command to look for something in the db
const findCommand = R.curry((collection,filter) => (optional={}) => {
  return R.pipe(
    R.assoc('find')(collection),
    R.assoc('filter')(filter),
    R.mergeLeft(validOptions(findOptional,optional)),
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
