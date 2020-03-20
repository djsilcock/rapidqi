import { get, pick, pickBy, fromPairs } from "lodash";

const deserialize = ({ _id, _rev, ...record }) => ({
  id: _id,
  rev: _rev,
  ...record
});
const serialize = ({ id, rev, ...record }) => ({
  _id: id,
  _rev: rev,
  ...record
});
const generateId = kind =>
  kind + " " + (Date.now() + Math.random()).toString(36);

function getLoggedInUser(parent, args, { database, currentUserId }, info) {
  //(parent,args,ctx,info)
  if (!currentUserId) return null;
  return database.get(currentUserId).then(deserialize);
}

async function getProject(parent, { id }, { database }) {
  const doc = await database.get(id);
  const result = deserialize(doc);
  return result;
}

async function projectList(parent, { filter }, { database, currentUserAdmin }) {
  const tags = filter?.includes("all") ? [] : filter ?? [];
  if (!currentUserAdmin) {
    tags.push("canDisplay");
    tags.push("isVetted");
  }
  const where = { _id: { $gte: "project ", $lt: "project!" } };
  if (tags.length > 0) {
    where.flags = { $all: tags };
  }

  const result = (await database.find({ selector: where })).docs.map(
    deserialize
  );

  return result;
}

function getUser(parent, { id }, { database }) {
  return database.get(id).then(deserialize);
}

async function allUsers(parent, args, { database }) {
  const users = await database.allDocs({
    startkey: "user ",
    endkey: "user!",
    include_docs: true
  });
  return users.rows.map(d => deserialize(d.doc));
}

async function addProject(
  parent,
  { project },
  { database, currentUserId, currentUserIsAdmin },
  info
) {
  const newproject = pick(project, [
    "title",
    "description",
    "dates",
    "methodology",
    "category",
    "email"
  ]);

  newproject.lastUpdatedBy = currentUserId;
  newproject.isVetted = !!currentUserIsAdmin;
  newproject.lastUpdated = new Date().toISOString();
  newproject.flags = Object.keys(
    pickBy({
      needsVetting: !currentUserIsAdmin,
      needsLead: !project.people.leaders.length,
      isRecruiting: project.advertise,
      isCompleted: project.dates.finish < new Date().toISOString(),
      hasCaldicott: project.caldicott == "Yes",
      hasResearch: project.research == "Yes",
      maybeCaldicott: project.caldicott == "DontKnow",
      maybeResearch: project.research == "DontKnow",
      pendingCaldicott: project.caldicott == "Pending",
      pendingResearch: project.research == "Pending",
      notCaldicott: (project.caldicott = "No"),
      notResearch: (project.research = "No"),
      criticalIncident: project.mm_or_ci == "Yes",
      canDisplay: project.candisplay == "Yes"
    })
  );

  const newrecords = [];
  const newpeople = fromPairs(
    (get(project, "people.new") ?? []).map(
      ({ id, realName, email, category }) => {
        const _id = generateId("user");
        newrecords.push({ _id, realName, email, category });
        return [id, _id];
      }
    )
  );
  newproject.people = {};

  for (let peopletype of ["proposers", "leaders", "involved"]) {
    newproject.people[peopletype] = get(
      project,
      ["people", peopletype],
      []
    ).map(personid => get(newpeople, personid, personid));
  }

  newproject.id = (project.id ?? "").startsWith("user ")
    ? project.id
    : generateId("project");
  if (project.rev) newproject.rev = project.rev;

  newrecords.push(serialize(newproject));
  await database.bulkDocs(newrecords);
  return getProject(
    {},
    { id: newproject.id },
    { database, currentUserId, currentUserIsAdmin },
    info
  );
}

async function updateUser(parent, { user }, { database }, info) {
  await database.put(serialize(user));
  return getUser(user.id);
}

async function addUser(parent, { user }, { database }, info) {
  const id = generateId("user");
  const { realName, email, category } = user;
  return updateUser(
    parent,
    { user: { id, realName, email, category } },
    { database },
    info
  );
}

async function getCategory(parent, args, { database }, { fieldName }) {
  const categories = await import("./taglist");
  const fetchList = parent[fieldName];
  return (fetchList || []).map(cat => ({ id: cat, name: categories[cat] }));
}

async function getListOfObjects(parent, args, { database }, { fieldName }) {
  const fetchList = parent[fieldName];
  const docs = await database.allDocs({ keys: fetchList, include_docs: true });
  return docs.rows
    .map(row => {
      if (!row.doc) return null;
      return deserialize(row.doc);
    })
    .filter(i => i);
}

async function getSingleRelation(parent, args, { database }, { fieldName }) {
  const result = await database.get(parent[fieldName]);
  if (result) {
    return deserialize(result);
  } else {
    return null;
  }
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
    category: getCategory,
    lastUpdatedBy: getSingleRelation
  },
  ProjectPeople: {
    proposers: getListOfObjects,
    leaders: getListOfObjects,
    involved: getListOfObjects
  }
};
export default resolvers;
