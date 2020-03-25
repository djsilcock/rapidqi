import getClient from "./apollo";
import gql from 'graphql-tag'
const query=gql`
query getUser($id: ID) {
  getUser(id: $id) {
    id
    userName
    realName
    email
    isAdmin
  }
}`

export default async function getUser({req,res,id}){
const client = getClient({ req, res })
      const result = await client.query({
        query,
        variables: { id }
      });
    return result?.data.getUser}