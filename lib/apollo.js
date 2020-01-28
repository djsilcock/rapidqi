
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

export function makeLink(){
 if (process.env.browser){
   return new HttpLink({uri:"/api/graphql"})
 }else{
   return new SchemaLink({schema:makeExecutableSchema({typeDefs:schema,resolvers:resolverMap})})
 }
}

export const withApollo = (App)=> withApollo(
   ({ ctx, headers, initialState }) =>
     new ApolloClient({
		 link:makeLink(),
		 ssrMode:!process.env.browser,
		 cache: new InMemoryCache().restore(initialState || {})
     })
 )(App)

