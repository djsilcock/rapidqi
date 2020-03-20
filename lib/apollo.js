import {
  useQuery,
  useMutation,
  useApolloClient,
  ApolloProvider
} from "@apollo/react-hooks";
import { getDataFromTree } from "@apollo/react-ssr";
import { HttpLink } from "apollo-link-http";
import { SchemaLink } from "apollo-link-schema";
import { makeExecutableSchema } from "graphql-tools";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloClient } from "apollo-client";
export { gql } from "graphql-tag";
import { schema } from "qiapp/queries";
import resolverMap from "./resolvers";

export { ApolloClient, HttpLink, InMemoryCache, ApolloProvider };
export { useQuery, useMutation, useApolloClient };
import nwa from "next-with-apollo";
import getContext from "./apollo-context";

const config = {};
export function makeLink(ctx) {
  if (process.browser) {
    return new HttpLink({ uri: "/api/graphql" });
  } else {
    Object.assign(config, { getDataFromTree });
    return new SchemaLink({
      context: getContext(ctx),
      schema: makeExecutableSchema({ typeDefs: schema, resolvers: resolverMap })
    });
  }
}

export const withApollo = App =>
  nwa(
    ({ ctx, headers, initialState, ...others }) =>
      new ApolloClient({
        link: makeLink(ctx),
        ssrMode: !process.browser,
        cache: new InMemoryCache().restore(initialState || {})
      }),
    { getDataFromTree }
  )(App);
