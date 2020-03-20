import schema from "./schema.gql";
import currentUser from "./currentuser.gql";
import projectList from "./projectlist.gql";
import getUser from "./getUser.gql";
import getProject from "./getProject.gql";
import addProject from "./addProject.gql";
import allUsers from "./allUsers.gql";
const SCHEMA = "schema",
  CURRENT_USER = "currentUser",
  PROJECT_LIST = "projectList",
  GET_USER = "getUser",
  GET_PROJECT = "getProject",
  ADD_PROJECT = "addProject",
  USER_LIST = "allUsers";

export {
  SCHEMA,
  CURRENT_USER,
  PROJECT_LIST,
  GET_PROJECT,
  GET_USER,
  ADD_PROJECT,
  USER_LIST
};
export {
  schema,
  currentUser,
  projectList,
  getUser,
  getProject,
  addProject,
  allUsers
};
