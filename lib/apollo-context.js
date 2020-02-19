function getServerContext({ req, res }) {
  return { req, res };
}

import DataStore from 'nedb'
import path from 'path'
function getDBContext(ctx) {
        class DataProvider {
        constructor(entityType){
            this.db=new DataStore({filename:path.resolve(process.env.ROOT_DIR,'db',entityType),autoload:true})
        }
        getById(_id){
            return this.where({_id}).then(s=>s[0])
        }
        where(criteria){
            return new Promise((res,rej)=>{
                this.db.find(criteria,(err,result)=>{if (err) rej(err); res(result)})
        })}
        insert(record){
            return new Promise((res,rej)=>{
                this.db.insert(record,(err,result)=>{if (err) {rej(err)}else{res(result)}})
        })}
        update(query,newrecord,options={}){
            return new Promise((res,rej)=>{
                this.db.update(query,newrecord,options,(err,numAffected,affectedDocs,upsert)=>{if (err) {rej(err)}else{res({numAffected,affectedDocs,upsert})}})
        })}
        remove(query,options){
            return new Promise((res,rej)=>{
                this.db.remove(query,options,(err,numRemoved)=>{if (err) {rej(err)}else{res(numRemoved)}})
        })}

        }
        
        
    return{
    User: new DataProvider('user'),
    Project: new DataProvider('project')
    }
  
}
function getAuthContext(ctx) {
  return {currentuser:'danielsilcock'};
}
export default function getContext(ctx) {
  return Object.assign({}, getServerContext(ctx), getDBContext(ctx), getAuthContext(ctx));
}
