const R = require('ramda')
const fps = require('@jadesrochers/fpstreamline')

const find = R.curry(async (collection, collname, query, findoptions={}, colloptions={}) => {
 var coll = await collection(collname, colloptions)
 var cursor = await coll.find(query, findoptions)
 return cursor
})

const checkExists = R.curry((collection, collname, query) => 
  fps.pipeAsync(
    find(collection, collname),
    cursor => cursor.count(true),
    R.lt(0),
  )(query)
)

const findOne = R.curry(async (collection, collname, query, findoptions={}, colloptions={}) => {
 var coll = await collection(collname, colloptions)
 var rslt = await coll.findOne(query, findoptions)
 return rslt
})

const aggregate = R.curry(async (collection, collname, pipeline, aggoptions={}, colloptions={}) => {
 var coll = await collection(collname, colloptions)
 var aggcursor = await coll.aggregate(pipeline, aggoptions)
 return aggcursor
})


const distinct = R.curry(async (collection, collname, key, query={}, distinctoptions={}, colloptions={}) => {
 var coll = await collection(collname, colloptions)
 var rslt = await coll.distinct(key, query, distinctoptions)
 return rslt
})


const insertMany = R.curry(async (collection, collname, docs, insertoptions={}, colloptions={}) => {
 docs = fps.toArray(docs)
 var coll = await collection(collname, colloptions)
 var rslt = await coll.insertMany(docs, insertoptions)
 return rslt
})

const deleteMany = R.curry(async (collection, collname, filter, deleteoptions={}, colloptions={}) => {
 var coll = await collection(collname, colloptions)
 var rslt = await coll.deleteMany(filter, deleteoptions)
 return rslt
})

const createIndexes = R.curry(async (collection, collname, indexes, indexoptions={}, colloptions={}) => {
 indexes = fps.toArray(indexes)
 var coll = await collection(collname, colloptions)
 var rslt = await coll.createIndexes(indexes, indexoptions)
 return rslt
})

const dropIndex = R.curry(async (collection, collname, name, indexoptions={}, colloptions={}) => {
 var coll = await collection(collname, colloptions)
 var rslt = await coll.dropIndex(name, indexoptions)
 return rslt
})


exports.find = find
exports.findOne = findOne
exports.aggregate = aggregate
exports.distinct = distinct
exports.insertMany = insertMany
exports.deleteMany = deleteMany
exports.createIndexes = createIndexes
exports.dropIndex = dropIndex


exports.checkExists = checkExists
