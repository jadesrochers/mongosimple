const R = require('ramda')
const fps = require('@jadesrochers/fpstreamline')

// Only leaving this for reference right now;
// API indicates 'filter' should be 'query', but only filter works
const findCommand = R.curry((collection,filter) => (optional={}) => {
  return R.pipe(
    R.assoc('find')(collection),
    R.assoc('filter')(filter),
    R.mergeLeft(validOptions(findOptional,optional)),
  )({})
})

exports.findCommand = findCommand
