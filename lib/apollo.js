
import {useQuery,useMutation,ApolloProvider} from '@apollo/react-hooks'
import {HttpLink} from 'apollo-link-http'
import {SchemaLink} from 'apollo-link-schema'
import {makeExecutableSchema} from 'apollo-server-micro'
import {InMemoryCache} from 'apollo-cache-inmemory'
import {ApolloClient} from 'apollo-client'
export {gql} from 'graphql-tag'
import schema from '~/queries/schema.gql'
import resolverMap from './resolvers'

export { ApolloClient, HttpLink, InMemoryCache,ApolloProvider };
export {useQuery,useMutation}
import withApollo from 'next-with-apollo'

export function makeLink(){
 if (process.env.browser){
   return new HttpLink({uri:"/api/graphql"})
 }else{
   return new SchemaLink({schema:makeExecutableSchema({typeDefs:schema,resolvers:resolverMap})})
 }
}

export default withApollo(
   ({ ctx, headers, initialState }) =>
     new ApolloClient({
		 link:new HttpLink({uri: `${(ctx && ctx.req)?'http://localhost:3000':''}/api/graphql`}),
		 ssrMode:!!(ctx && ctx.req),
		 cache: new InMemoryCache().restore(initialState || {})
     })
 )(MyApp)

