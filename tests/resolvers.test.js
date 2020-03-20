/*eslint-env jest,node  */

import resolvers from "../lib/resolvers";

import { makeClient } from "./client";
import { makedatabase } from "./database";

var someuserid, someprojectid, database, client, adminclient;

beforeAll(async () => {
  database = await makedatabase();
  client = () =>
    makeClient({ database, currentuser: { id: someuserid, isAdmin: false } });
  adminclient = () =>
    makeClient({ database, currentuser: { id: someuserid, isAdmin: true } });

  await Promise.all([
    database
      .allDocs({ startkey: "user ", endkey: "user!", limit: 1 })
      .then(r => {
        someuserid = r.rows[0].id;
      }),
    database
      .allDocs({ startkey: "project ", endkey: "project!", limit: 1 })
      .then(r => {
        someprojectid = r.rows[0].id;
      })
  ]);
  return;
});

test("db exists", () => {
  expect(database).toEqual(expect.anything());
});
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
describe("Getting a single project", () => {
  test("works with resolver", async () => {
    const result = await resolvers.Query.getProject(
      {},
      { id: someprojectid },
      { database, currentuser: { id: someuserid, isAdmin: true } }
    );
    expect(result).toHaveProperty("id");
  });

  test("works with query", async () => {
    const query = await import("../queries/getProject.gql");
    const result = await client().query({
      query,
      variables: { id: someprojectid }
    });
    expect(result).toHaveProperty("data");
  });
});

describe("Getting a single user", () => {
  test("works with resolver", async () => {
    const result = await resolvers.Query.getProject(
      {},
      { id: someuserid },
      { database, currentuser: { id: someuserid, isAdmin: true } }
    );
    expect(result).toHaveProperty("id");
  });

  test("works with query", async () => {
    const query = await import("../queries/getUser.gql");
    const result = await client().query({
      query,
      variables: { id: someuserid }
    });
    expect(result).toHaveProperty("data");
  });
  test("works with logged-in user", async () => {
    const query = await import("../queries/currentuser.gql");
    const result = await client().query({ query });
    expect(result).toHaveProperty("data");
  });
});

describe("Returning list of projects", () => {
  test("works with resolver", async () => {
    const results = await resolvers.Query.projectList(
      {},
      { filter: ["canDisplay"] },
      { database, currentuser: { isAdmin: true } }
    );
    expect(results).not.toHaveLength(0);

    expect(results[0]).toEqual(
      expect.objectContaining({
        id: expect.anything(),
        rev: expect.anything(),
        title: expect.anything(),
        people: expect.anything(),
        description: expect.anything(),
        dates: expect.anything(),
        methodology: expect.anything(),
        category: expect.anything(),
        email: expect.anything(),
        lastUpdated: expect.anything(),
        lastUpdatedBy: expect.anything(),
        flags: expect.anything()
      })
    );
  });

  test("works with query", async () => {
    const query = await import("../queries/projectlist.gql");
    const result = await client().query({ query });
    expect(result).toHaveProperty("data");
    expect(result.data.projectList).not.toHaveLength(0);
  });

  test("admin users should be able to see unvetted projects", async () => {
    const query = await import("../queries/projectlist.gql");
    const result = await adminclient().query({ query });
    expect(result).toHaveProperty("data");
    expect(
      result.data.projectList.filter(project =>
        project.flags.includes("needsVetting")
      )
    ).not.toHaveLength(0);
  });

  test("normal users should not be able to see unvetted projects", async () => {
    const query = await import("../queries/projectlist.gql");
    const result = await client().query({ query });
    expect(result).toHaveProperty("data");
    expect(
      result.data.projectList.filter(project =>
        project.flags.includes("needsVetting")
      )
    ).toHaveLength(0);
  });
});

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

describe("Adding project to database", () => {
  const project = {
    title: "Test project",
    people: {
      proposers: ["1"],
      leaders: ["2"],
      involved: ["NEW_1"],
      new: [
        {
          id: "NEW_1",
          realName: "Real Name",
          email: "here@there.com",
          category: "FY1"
        }
      ]
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
  };

  test("works directly with resolver", async () => {
    const newproject = await resolvers.Mutation.addProject(
      {},
      { project },
      { database, currentuser: { isAdmin: true } }
    );
    expect(newproject).toHaveProperty("id");
  });

  test("works with mutation", async () => {
    const mutation = await import("../queries/addproject.gql");
    const result = await client().mutate({ mutation, variables: { project } });
    expect(result).toHaveProperty("data");
  });
  test("correctly creates new user", async () => {
    const mutation = await import("../queries/addproject.gql");
    const result = await client().mutate({ mutation, variables: { project } });
    expect(result).toHaveProperty("data.addProject.people.involved");
    const newperson = result.data.addProject.people.involved[0];
    expect(newperson).toHaveProperty("realName", "Real Name");
    const dbcheck = await database.get(newperson.id);
    expect(dbcheck).toBeDefined();
    expect(dbcheck).toHaveProperty("realName", "Real Name");
  });
  test("normal users should require their projects to be vetted", async () => {
    const mutation = await import("../queries/addproject.gql");
    const result = await client().mutate({ mutation, variables: { project } });
    expect(result).toHaveProperty("data");
    expect(result.data.addProject.flags).toEqual(
      expect.arrayContaining(["needsVetting"])
    );
  });
  test("admin users should not require their projects to be vetted", async () => {
    const mutation = await import("../queries/addproject.gql");
    const result = await adminclient().mutate({
      mutation,
      variables: { project }
    });
    expect(result).toHaveProperty("data");
    expect(result.data.addProject.flags).not.toEqual(
      expect.arrayContaining(["needsVetting"])
    );
  });
});
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
