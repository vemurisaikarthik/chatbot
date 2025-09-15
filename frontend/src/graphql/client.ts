import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

const USER_SERVICE_URI = 'http://localhost:4001/graphql';
const CHAT_SERVICE_URI = 'http://localhost:4002/graphql';
const CHAT_SERVICE_WS_URI = 'ws://localhost:4002/graphql';

const userHttpLink = new HttpLink({
  uri: USER_SERVICE_URI,
});

const chatHttpLink = new HttpLink({
  uri: CHAT_SERVICE_URI,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: CHAT_SERVICE_WS_URI,
  })
);

const httpLink = split(
  ({ query }) => {
    const queryString = query.loc?.source.body || '';
    
    // Route user operations to user service
    return (
      queryString.includes('userByUsername') ||
      queryString.includes('createUser') ||
      (queryString.includes('users') && !queryString.includes('chatsByUser'))
    );
  },
  userHttpLink,
  chatHttpLink
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});