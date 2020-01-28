import { ApolloServer} from 'apollo-server-micro'
import {schema as typeDefs} from '~/queries'
import {getContext} from '~/lib/apollo' 
import nedb from 'nedb'
const datastore={}
import resolvers from '~/lib/resolvers'
const apolloServer = new ApolloServer({ typeDefs, resolvers,formatError: error => {
    console.log(error);
    return error;
  },
  formatResponse: response => {
    console.log(response);
    return response;
  },
  context:getContext })

export const config = {
  api: {
    bodyParser: false,
  },
}

export default apolloServer.createHandler({ path: '/api/graphql' })
