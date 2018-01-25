import api, { findOne } from 'olymp-api';
import { merge } from 'lodash';
import { lambdaHandler, transformUser } from './auth';
import * as modules from './schema';

const typeDefs = `
  scalar Json
  scalar DateTime

  type Image {
    src: String
    width: Int
    height: Int
  }
  enum COLOR_FORMAT {
    RGB
    HEX
  }
  type User {
    id: String
    access: Json
    username: String
    email: String
    ref: String
    name: String
    intercom: String
    apps: [App]
  }
  type Query {
    _ : Boolean
    user(id: ID!): User
  }
  type Mutation {
    _ : Boolean
  }
`;

const resolvers = {
  Query: {
    _: () => true,
    user: async (_, { id }, { auth0, userId, access }) => {
      if (!id || id !== userId) {
        return null;
      }
      console.log(Object.keys(access));
      const [user, ...apps] = await Promise.all([
        auth0.getUser({ id }),
        ...Object.keys(access).map(x => findOne('app', x))
      ]);
      return {
        ...transformUser(user),
        apps: apps.filter(x => x)
      };
    }
  },
  Mutation: {
    _: () => true
  }
};

export const { server, playground } = api({
  mongoUri: process.env.MONGODB_URI,
  typeDefs: Object.keys(modules).reduce(
    (result, key) => `${result}\n${modules[key].typeDefs || ''}`,
    typeDefs
  ),
  resolvers: Object.keys(modules).reduce(
    (result, key) => merge(result, modules[key].resolvers || {}),
    resolvers
  ),
  context: ({ event }) => lambdaHandler(event)
});
