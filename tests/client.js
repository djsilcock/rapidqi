import { SchemaLink } from "apollo-link-schema";
import { makeExecutableSchema } from "graphql-tools";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
import resolvers from "../lib/resolvers";
import typeDefs from "../queries/schema.gql";

export function makeClient(ctx) {
  return new ApolloClient({
    link: new SchemaLink({
      context: () => ctx,
      schema: makeExecutableSchema({ typeDefs, resolvers })
    }),
    ssrMode: true,
    cache: new InMemoryCache()
  });
}
