
const find = R.curry(async (collection, collname, query, findoptions={}, colloptions={}) => {
 var cursor = await collection(collname, colloptions).find(query, findoptions)
 return cursor
})

const findOne = R.curry(async (collection, collname, query, findoptions={}, colloptions={}) => {
 var cursor = await collection(collname, colloptions).findOne(query, findoptions)
 return cursor
})

const insertMany = R.curry(async (collection, collname, docs, insertoptions={}, colloptions={}) => {
 docs = fps.toArray(docs)
 var rslt = await collection(collname, colloptions).insertMany(query, insertoptions)
 return rslt
})

const deleteMany = R.curry(async (collection, collname, filter, deleteoptions={}, colloptions={}) => {
 var rslt = await collection(collname, colloptions).deleteMany(filter, deleteoptions)
 return rslt
})

const createIndexes = R.curry(async (collection, collname, indexes, indexoptions={}, colloptions={}) => {
 indexes = fps.toArray(indexes)
 var rslt = await collection(collname, colloptions).createIndexes(indexes, indexoptions)
 return rslt
})

const dropIndex = R.curry(async (collection, collname, name, indexoptions={}, colloptions={}) => {
 var rslt = await collection(collname, colloptions).dropIndex(name, indexoptions)
 return rslt
})


exports.find = find
exports.findOne = findOne
exports.insertMany = insertMany
exports.deleteMany = deleteMany
exports.createIndexes = createIndexes
exports.dropIndex = dropIndex
