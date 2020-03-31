import { SchemaLink } from "apollo-link-schema";
import { makeExecutableSchema } from "graphql-tools";
import resolverMap from "./resolvers";

import gql from "graphql-tag";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";

export { ApolloClient, InMemoryCache };

import PouchDB from "pouchdb";
import * as relpouch from "relational-pouch";
import * as pouchfind from "pouchdb-find";
import Cookies from "cookies";

const schema = gql`
  enum YesNoPending {
    Yes
    No
    Pending
    DontKnow
  }
  enum StaffType {
    FY1
    FY2
    ACCS
    Core
    Int
    Higher
    SAS
    Consultant
  }
  scalar Date

  type User {
    id: ID
    rev: ID
    userName: String
    realName: String
    email: String
    category: StaffType
    isAdmin: Boolean
  }

  type Category {
    id: ID
    name: String
  }

  type ProjectPeople {
    proposers: [User]
    leaders: [User]
    involved: [User]
  }

  type ProjectDates {
    proposed: Date
    start: Date
    finish: Date
  }

  type Project {
    id: ID!
    rev: ID!
    title: String!
    people: ProjectPeople
    description: String!
    dates: ProjectDates
    methodology: String!
    category: [Category]
    email: String
    lastUpdated: Date
    lastUpdatedBy: User
    flags: [Flag]
  }
  type ActionPoint {
    id: ID!
    rev: ID!
    title: String!
    people: ProjectPeople
    description: String!
    dates: ProjectDates
    events: [Event]
    methodology: String!
    category: [Category]
    lastUpdated: Date
    lastUpdatedBy: User
    flags: [Flag]
  }

  type Event {
    id: ID!
    rev: ID!
    title: String!
    people: ProjectPeople
    eventDate: Date
    triumphs: String!
    challenges: String!
    suggestions: String!
    actionPoints: [ActionPoint]
    dates: ProjectDates
    description: String!
    category: [Category]
    email: String
    lastUpdated: Date
    lastUpdatedBy: User
    flags: [Flag]
  }

  input ActionPointInput {
    id: ID!
    rev: ID!
    title: String!
    people: ProjectPeopleInput
    description: String!
    dates: ProjectDatesInput
    events: [ID]
    methodology: String!
    category: [ID]
    lastUpdated: Date
    lastUpdatedBy: UserInput
    flags: [Flag]
  }

  input EventInput {
    id: ID!
    rev: ID!
    title: String!
    people: ProjectPeopleInput
    eventDate: Date
    triumphs: String!
    challenges: String!
    suggestions: String!
    actionPoints: [ActionPointInput]
    dates: ProjectDatesInput
    description: String!
    category: [ID]
    email: String
    flags: [Flag]
  }

  input UserInput {
    id: ID
    rev: ID
    realName: String
    email: String
    category: StaffType
  }
  input ProjectPeopleInput {
    proposers: [ID]
    leaders: [ID]
    involved: [ID]
    new: [UserInput]
  }
  input ProjectDatesInput {
    proposed: Date
    start: Date
    finish: Date
  }

  enum Flag {
    needsVetting
    isVetted
    needsLead
    isRecruiting
    isCompleted
    hasCaldicott
    hasResearch
    maybeCaldicott
    maybeResearch
    pendingCaldicott
    pendingResearch
    notCaldicott
    notResearch
    criticalIncident
    canDisplay
    hidden

    recentlyUpdated
    all
  }

  type Query {
    getLoggedInUser: User
    getProject(id: ID): Project
    projectList(filter: [Flag]): [Project]
    eventList(filter: [Flag]): [Event]
    allUsers: [User!]!
    getUser(id: ID): User
    getCategories: [Category]
  }

  type Mutation {
    addUser(user: UserInput): User
    addEvent(event: EventInput): Event
    updateUser(user: UserInput): User
  }
`;

PouchDB.plugin(relpouch);
PouchDB.plugin(pouchfind);

const dbname = "database";
function getServerContext({ req, res }) {
  return { req, res };
}

function getDBContext() {
  return { database: new PouchDB(dbname) };
}

function getAuthContext({ req, res }) {
  const keys = ["mysupersecretkey"];
  const cookies = new Cookies(req, res, { keys });
  return {
    get currentUserId() {
      return cookies.get("userid", { signed: true });
    },
    set currentUserId(userid) {
      return cookies.set("userid", userid, { signed: true });
    },
    get currentUserIsAdmin() {
      return !!cookies.get("isAdmin", { signed: true });
    },
    set currentUserIsAdmin(isAdmin) {
      return cookies.set("isAdmin", isAdmin ? "yes" : undefined, {
        signed: true
      });
    }
  };
}

function getContext(ctx) {
  if (process.env.NODE_ENV == "test" && ctx.override_ctx)
    return ctx.override_ctx;
  return Object.assign(
    {},
    getServerContext(ctx),
    getDBContext(ctx),
    getAuthContext(ctx)
  );
}

export default function getClient(ctx) {
  return new ApolloClient({
    link: new SchemaLink({
      context: getContext(ctx),
      schema: makeExecutableSchema({ typeDefs: schema, resolvers: resolverMap })
    }),
    cache: new InMemoryCache()
  });
}
