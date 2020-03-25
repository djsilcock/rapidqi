import gql from 'graphql-tag'
import getClient from './apollo'

export default async function getCategories({req,res}){
    const client=getClient({req,res})
    const result=await client.query({
        query:gql`
            query {
                getCategories {
                    id
                    name
                }
            }`
    })
    return result.data.getCategories
}
