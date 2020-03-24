import { SchemaLink } from "apollo-link-schema";
import { makeExecutableSchema } from "graphql-tools";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import { schema } from "qiapp/queries";
import resolverMap from "../lib/resolvers";

export { ApolloClient, InMemoryCache };

import PouchDB from "pouchdb";
import * as relpouch from "relational-pouch";
import * as pouchfind from "pouchdb-find";
import Cookies from "cookies";
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
