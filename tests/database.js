
import PouchDB from 'pouchdb'
PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(require('pouchdb-adapter-memory'))
import docs from './testdata.js'
export async function makedatabase(){
const database = new PouchDB('testdatabase',{adapter:'memory'});
await database.bulkDocs(docs)
return database
}