import gql from 'graphql-tag'
import getClient from "./apollo";

const allUsers=gql`
query allUsers{
  allUsers{
      id
      userName
      realName
      email
      category
      isAdmin
  }
}
`

export default async function getAllUsers({filter,req,res}){
  const client = getClient({ req, res });
  return (await client.query({
    query: allUsers,
    variables: { filter }
  }))?.data.allUsers
}