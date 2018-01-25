import { findOne, updateOne, find } from 'olymp-api';

export default {
  typeDefs: `
    type App {
      id: ID!
      createdAt: DateTime!
      updatedAt: DateTime!
      name: String
      description: String
      collections: [Json!]!
    }
    input AppInput {
      id: ID
      createdAt: DateTime
      updatedAt: DateTime
      name: String
      description: String
    }
  `,
  /*
    extend type Query {
      app(id: ID!): App
      appList: [App]!
    }
    extend type Mutation {
      app(data: AppInput!): App
    }
  */
  resolvers: {
    App: {
      collections: ({ collections }) => collections || []
    },
    Query: {
      // app: (_, { id }) => findOne('app', id),
      // appList: (_, __) => find('app')
    },
    Mutation: {
      // app: (_, { data }) => updateOne('app', data)
    }
  }
};
