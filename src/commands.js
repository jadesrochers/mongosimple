const R = require('ramda')
const fps = require('@jadesrochers/fpstreamline')

const find = R.curry(async (collection, collname, query, findoptions={}, colloptions={}) => {
 let coll = await collection(collname, colloptions)
 let cursor = await coll.find(query, findoptions)
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
 let coll = await collection(collname, colloptions)
 let rslt = await coll.findOne(query, findoptions)
 return rslt
})

const aggregate = R.curry(async (collection, collname, pipeline, aggoptions={}, colloptions={}) => {
 let coll = await collection(collname, colloptions)
 let aggcursor = await coll.aggregate(pipeline, aggoptions)
 return aggcursor
})


const distinct = R.curry(async (collection, collname, key, query={}, distinctoptions={}, colloptions={}) => {
 let coll = await collection(collname, colloptions)
 let rslt = await coll.distinct(key, query, distinctoptions)
 return rslt
})


const insertMany = R.curry(async (collection, collname, docs, insertoptions={}, colloptions={}) => {
 docs = fps.toArray(docs)
 let coll = await collection(collname, colloptions)
 let rslt = await coll.insertMany(docs, insertoptions)
 return rslt
})

const deleteMany = R.curry(async (collection, collname, filter, deleteoptions={}, colloptions={}) => {
 let coll = await collection(collname, colloptions)
 let rslt = await coll.deleteMany(filter, deleteoptions)
 return rslt
})

const createIndexes = R.curry(async (collection, collname, indexes, indexoptions={}, colloptions={}) => {
 indexes = fps.toArray(indexes)
 let coll = await collection(collname, colloptions)
 let rslt = await coll.createIndexes(indexes, indexoptions)
 return rslt
})

const dropIndex = R.curry(async (collection, collname, name, indexoptions={}, colloptions={}) => {
 let coll = await collection(collname, colloptions)
 let rslt = await coll.dropIndex(name, indexoptions)
 return rslt
})

const indexes = R.curry(async (collection, collname, indexoptions={}, colloptions={}) => {
 let coll = await collection(collname, colloptions)
 let rslt = await coll.indexes(indexoptions)
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
exports.indexes = indexes

exports.checkExists = checkExists
