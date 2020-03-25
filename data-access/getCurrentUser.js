import gql from 'graphql-tag'
import getClient from "./apollo";


const currentUser=gql`
query currentuser{
  getLoggedInUser{
          id
          userName
          realName
          email
          isAdmin
  }
}`

export default async function getCurrentUser({req,res}){
    const client = getClient({ req, res });
    return client.query({
        query: currentUser
      }).then(result=>result?.data?.getLoggedInUser)
}
