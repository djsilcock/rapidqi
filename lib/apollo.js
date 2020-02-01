
import {useQuery,useMutation,ApolloProvider} from '@apollo/react-hooks'
import {HttpLink} from 'apollo-link-http'
import {SchemaLink} from 'apollo-link-schema'
import {makeExecutableSchema} from 'graphql-tools'
import {InMemoryCache} from 'apollo-cache-inmemory'
import {ApolloClient} from 'apollo-client'
export {gql} from 'graphql-tag'
import schema from '~/queries/schema.gql'
import resolverMap from './resolvers'

export { ApolloClient, HttpLink, InMemoryCache,ApolloProvider };
export {useQuery,useMutation}
import nwa from 'next-with-apollo'

export function getContext({req, res}) {
  return {req, res} 
} 

function makeLink(ctx){
 if (process.browser){
   return new HttpLink({uri:"/api/graphql"})
 }else{
   console.log(ctx)
   return new SchemaLink({context:getContext(ctx) , 
schema:makeExecutableSchema({typeDefs:schema,resolvers:resolverMap})})
 }
}

export const withApollo = (App)=> nwa(
   ({ ctx, headers, initialState,...others }) =>
     console.log({ctx,headers,initialState,others}) ||
     new ApolloClient({
		 link:makeLink(ctx),
		 ssrMode:!process.browser,
		 cache: new InMemoryCache().restore(initialState || {})
     }),{getDataFromTree:'always'}
 )(App)

