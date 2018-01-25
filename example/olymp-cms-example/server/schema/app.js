import { findOne, updateOne, find } from 'olymp-api';

export default {
  typeDefs: `
    type App {
      id: ID!
      createdAt: DateTime!
      updatedAt: DateTime!
      name: String
      description: String
      schema: Json
    }
    input AppInput {
      id: ID
      createdAt: DateTime
      updatedAt: DateTime
      name: String
      description: String
      schema: Json
    }
    extend type Query {
      app(id: ID!): App
      appList: [App]!
    }
    extend type Mutation {
      app(data: AppInput!): App
    }
  `,
  resolvers: {
    Query: {
      app: (_, { id }) => findOne('app', id),
      appList: (_, __, context) => {
        console.log(context);
        return find('app');
      }
    },
    Mutation: {
      app: (_, { data }) => updateOne('app', data)
    }
  }
};
