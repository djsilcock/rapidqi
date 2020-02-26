function getServerContext({ req, res }) {
  return { req, res };
}

import PouchDB from 'pouchdb'
import * as relpouch from 'relational-pouch'
import * as pouchfind from 'pouchdb-find'

PouchDB.plugin(relpouch);
PouchDB.plugin(pouchfind);

import path from 'path'


function getDBContext(ctx) { 
    return{database:new PouchDB('database')}
  
}
function getAuthContext(ctx) {
  return {currentuser:'danielsilcock'};
}
export default function getContext(ctx) {
  return Object.assign({}, getServerContext(ctx), getDBContext(ctx), getAuthContext(ctx));
}
