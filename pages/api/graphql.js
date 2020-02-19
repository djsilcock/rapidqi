import { ApolloServer} from 'apollo-server-micro'
import typeDefs from 'qiapp/queries/schema.gql'
import getContext from 'qiapp/lib/apollo-context' 

import resolvers from 'qiapp/lib/resolvers'


const apolloServer = new ApolloServer({ typeDefs, resolvers,formatError: error => {
    console.log(error);
    return error;
  },
  formatResponse: response => {
    return response;
  },
  context:getContext})

export const config = {
  api: {
    bodyParser: false,
  },
}

export default apolloServer.createHandler({ path: '/api/graphql' })
