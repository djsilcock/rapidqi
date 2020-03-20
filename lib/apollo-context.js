function getServerContext({ req, res }) {
  return { req, res };
}

import PouchDB from "pouchdb";
import * as relpouch from "relational-pouch";
import * as pouchfind from "pouchdb-find";
import Cookies from "cookies";
PouchDB.plugin(relpouch);
PouchDB.plugin(pouchfind);

const dbname = "database";
export function getDBContext(ctx) {
  return { database: new PouchDB(dbname) };
}
export function getAuthContext({ req, res }) {
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
export default function getContext(ctx) {
  if (process.env.NODE_ENV == "test" && ctx.override_ctx)
    return ctx.override_ctx;
  return Object.assign(
    {},
    getServerContext(ctx),
    getDBContext(ctx),
    getAuthContext(ctx)
  );
}
