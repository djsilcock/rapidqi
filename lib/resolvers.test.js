/*eslint-env jest,node  */

import resolvers from './resolvers'
import PouchDB from 'pouchdb'
import * as pouchfind from 'pouchdb-find'
import populateDB from '../populate_test_db'
PouchDB.plugin(pouchfind);
const database = new PouchDB('testdatabase')

import { SchemaLink } from 'apollo-link-schema'
import { makeExecutableSchema } from 'graphql-tools'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import * as path from 'path'
import fs from 'fs'
import gql from 'graphql-tag'
const typeDefs = gql(fs.readFileSync(path.resolve(__dirname, '../queries/schema.gql'), { encoding: 'utf8' }))

const client = new ApolloClient({
  link: new SchemaLink({
    context: () => ({ database, currentuser: { id:'user 1',isAdmin: true } }),
    schema: makeExecutableSchema({ typeDefs, resolvers })
  }),
  ssrMode: true,
  cache: new InMemoryCache()
})
beforeAll(async ()=>{
  const docs=await database.allDocs()
  if (docs.rows.length==0) await populateDB(database,{users:20,admins:2,projects:100})
  return
})

test('db exists', () => {
  expect(database).toEqual(expect.anything())
})
/* 
import { get, pick, pickBy, fromPairs } from 'lodash'
const deserialize = ({ _id, _rev, ...record }) => ({ id: _id, rev: _rev, ...record })
const serialize = ({ id, rev, ...record }) => ({ _id: id, _rev: rev, ...record })
const generateId = (kind) => (kind + ' ' + (Date.now() + Math.random()).toString(36))
*/

/* function getLoggedInUser(parent, args, { database, currentuser }, info) {     //(parent,args,ctx,info)
  return database.get(currentuser).then(deserialize)
} */


/* 
function getProject(parent, { id }, { database }) {
  return database.get(id).then(deserialize)
}
 */
describe('Getting a single project', () => {
  const testid="project k79lgwan.wfj"
  test('works with resolver', async () => {
    const result= await resolvers.Query.getProject({}, { id: testid }, { database, currentuser: { isAdmin: true } })
    expect(result).toHaveProperty('id')
  })

  test('works with query', async () => {
    const query = gql(fs.readFileSync(path.resolve(__dirname, '../queries/getProject.gql'), { encoding: 'utf8' }))
    const result = await client.query({ query,variables:{id:testid} })
    expect(result).toHaveProperty('data')
  })
})

describe('Returning list of projects', () => {
  test('works with resolver', async () => {
    return resolvers.Query.projectList({}, { filter: [] }, { database, currentuser: { isAdmin: true } })
  })

  test('works with query', async () => {
    const query = gql(fs.readFileSync(path.resolve(__dirname, '../queries/projectlist.gql'), { encoding: 'utf8' }))
    const result = await client.query({ query })
    expect(result).toHaveProperty('data')
  })
})

/* 
function getUser(parent, { id }, { database }) {
  return database.get(id).then(deserialize)
}
 */
/* 
 async function allUsers(parent, args, { database }) {
  const users = await database.allDocs({ startkey: 'user ', endkey: 'user!', includeDocs: true })
  return users.rows.map((d) => deserialize(d.doc))
}
 */


describe('Adding project to database', () => {
  const project = {
    title: "Test project",
    people: {
      proposers: ['1'],
      leaders: ['2'],
      involved: ['NEW_1'],
      new: [{
        id: 'NEW_1',
        realName: "Real Name",
        email: "here@there.com",
        category: 'FY1'
      }]
    },
    description: "My description",
    methodology: "My methodology",
    category: ["cc"],
    othertags: "String",
    email: "email@example.com",
    advertise: "Yes",
    mm_or_ci: "Yes",
    caldicott: "Yes",
    research: "Yes",
    dates: {
      proposed: new Date().toISOString(),
      start: new Date().toISOString(),
      finish: new Date().toISOString()
    },
    canDisplay: "Yes"
  }
    
  test('works directly with resolver', async () => {
    const newproject=await resolvers.Mutation.addProject({}, { project }, { database, currentuser: { isAdmin: true } })
    expect(newproject).toHaveProperty('id')
  })
  

  test('works with mutation', async () => {
    const mutation = gql(fs.readFileSync(path.resolve(__dirname, '../queries/addproject.gql'), { encoding: 'utf8' }))
    const result = await client.mutate({ mutation, variables: { project }})
    expect(result).toHaveProperty('data')
  })
  test('correctly creates new user', async () => {
    const mutation = gql(fs.readFileSync(path.resolve(__dirname, '../queries/addproject.gql'), { encoding: 'utf8' }))
    const result = await client.mutate({ mutation, variables: { project }})
    expect(result).toHaveProperty('data.addProject.people.involved')
    const newperson=result.data.addProject.people.involved[0]
    expect(newperson).toHaveProperty('realName','Real Name')
    const dbcheck=await database.get(newperson.id)
    expect(dbcheck).toBeDefined()
    expect(dbcheck).toHaveProperty('realName','Real Name')
  })
  
})
/*
async function updateUser(parent, { user }, { database }, info) {
  await database.put(serialize(user))
  return getUser(user.id)
}

async function addUser(parent, { user }, { database }, info) {
  const id = generateId('user')
  const { realName, email, category } = user
  return updateUser(parent, { user: { id, realName, email, category } }, { database }, info)
}
*/
