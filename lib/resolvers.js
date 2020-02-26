
import { get, pick, pickBy, fromPairs } from 'lodash'
const deserialize = ({ _id, _rev, ...record }) => ({ id: _id, rev: _rev, ...record })
const serialize = ({ id, rev, ...record }) => ({ _id: id, _rev: rev, ...record })
const generateId = (kind) => (kind + ' ' + (Date.now() + Math.random()).toString(36))

function getLoggedInUser(parent, args, { database, currentuser }, info) {     //(parent,args,ctx,info)
  return database.get(currentuser).then(deserialize)
}
function getProject(parent, { id }, { database }) {
  return database.get(id).then(deserialize)
}

async function projectList(parent, { filter }, { database, currentuser }) {
  const tags = filter ?? []
  if (!currentuser?.isAdmin) {tags.push('isVetted');tags.push('canDisplay')}
  return (await database.find(
    { _id: { $gte: 'project ', $lt: 'project!' } ,
     tags:{$all:tags}
  })).docs.map(deserialize)
}

function getUser(parent, { id }, { database }) {
  return database.get(id).then(deserialize)
}

async function allUsers(parent, args, { database }) {
  const users = await database.allDocs({ startkey: 'user ', endkey: 'user!', includeDocs: true })
  return users.rows.map((d) => deserialize(d.doc))
}

async function addProject(parent, { proj }, { database, currentuser }, info) {
  
  const newproject = pick(proj, [
    'title',
    'description',
    'dates',
    'methodology',
    'category',
    'email'])

  newproject.lastUpdatedBy = currentuser.id
  newproject.isVetted = !!proj.lastUpdatedBy.isAdmin
  newproject.lastUpdated = new Date().toISOString()
  newproject.flags = Object.keys(pickBy({
    needsVetting: !currentuser.isAdmin,
    needsLead: !proj.people.leaders.length,
    isRecruiting: proj.advertise,
    isCompleted: proj.dates.finish < new Date().toISOString(),
    hasCaldicott: proj.caldicott == 'Yes',
    hasResearch: proj.research == 'Yes',
    maybeCaldicott: proj.caldicott == 'DontKnow',
    maybeResearch: proj.research == 'DontKnow',
    pendingCaldicott: proj.caldicott == 'Pending',
    pendingResearch: proj.research == 'Pending',
    notCaldicott: proj.caldicott = 'No',
    notResearch: proj.research = 'No',
    criticalIncident: proj.mm_or_ci == 'Yes',
    canDisplay: proj.candisplay == 'Yes'
  }))
  const newrecords = []
  const newpeople = fromPairs(
    (get(proj, 'people.new') ?? [])
      .map(({ id, realName, email, category }) => {
        const _id = generateId('user')
        newrecords.push({ _id, realName, email, category })
        return [id, _id]
      }));
  newproject.people = {}

  for (let peopletype of ['proposers', 'leaders', 'involved']) {
    newproject.people[peopletype] = get(proj, ['people', peopletype], [])
      .map((personid) => get(newpeople, personid, personid))
  }

  newproject.id=proj.id ?? generateId('project')
  if (proj.rev) newproject.rev=proj.rev

  newrecords.push(serialize(proj))
  await database.bulkDocs(newrecords)
  return getProject(proj.id)
}

async function updateUser(parent, { user }, { database }, info) {
  await database.put(serialize(user))
  return getUser(user.id)
}

async function addUser(parent, { user }, { database }, info) {
  const id = generateId('user')
  const { realName, email, category } = user
  return updateUser(parent, { user: { id, realName, email, category } }, { database }, info)
}

async function getListOfObjects(parent, args, { database }, { fieldName }) {
  const fetchList = parent[fieldName]
  return database.allDocs({ keys: fetchList })
}
async function getSingleRelation(parent, args, { database }, { fieldName }) {
  return database.get(parent[fieldName])
}


const resolvers = {
  Query: {
    getLoggedInUser,
    getProject,
    projectList,
    getUser,
    allUsers
  },
  Mutation: {
    addProject,
    addUser,
    updateUser
  },
  Project: {
    category: getListOfObjects,
    lastUpdatedBy: getSingleRelation
  },
  ProjectPeople: {
    proposers: getListOfObjects,
    leaders: getListOfObjects,
    involved: getListOfObjects
  }
}
export default resolvers
