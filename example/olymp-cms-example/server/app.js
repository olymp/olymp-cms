import api, { findOne, updateOne, find } from 'olymp-api';
import { get } from 'lodash';
import { lambdaHandler, transformUser } from './auth';

const typeDefs = `
  scalar Json
  scalar DateTime

  enum DOCUMENT_STATE {
    DRAFT
    PUBLISHED
    DELETED
  }
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
  type Document {
    id: ID!
    rootId: String
    type: String
    createdAt: DateTime!
    updatedAt: DateTime!
    state: DOCUMENT_STATE
    slug: String
    name: String
    description: String
    tags: [String!]
    image: Json
    data: Json
    color: String
    start: DateTime
    end: DateTime
    extract: String
    nodes: [Json!]
    text: String
    toc: [Json!]
  }
  input DocumentInput {
    id: ID
    appId: ID
    rootId: String
    type: String
    createdAt: DateTime
    updatedAt: DateTime
    state: DOCUMENT_STATE
    slug: String
    name: String
    description: String
    tags: [String!]
    image: Json
    data: Json
    color: String
    start: DateTime
    end: DateTime
    extract: String
    nodes: [Json!]
    text: String
    toc: [Json!]
  }
  input FileInput {
    id: ID
    appId: ID
    url: String
    publicId: String
    type: String
    format: String
    version: Int
    resourceType: String
    createdAt: String
    height: Int
    width: Int
    bytes: Int
    caption: String
    source: String
    removed: Boolean
    colors: [String]
    tags: [String]
    folder: String
  }
  type File {
    id: ID!
    appId: ID
    url: String!
    publicId: String!

    type: String
    format: String
    version: Int
    resourceType: String
    createdAt: String
    height: Int
    width: Int
    bytes: Int
    caption: String
    source: String
    removed: Boolean
    colors: [String]
    tags: [String]
    folder: String
  }
  type Query {
    hello(name: String): String
    document(id: ID!): Document
    documentList(type: String, app: String, state: DOCUMENT_STATE): [Document]!
    app(id: ID!): App
    appList: [App]!
    file(id: ID): File
    fileList: [File!]
    fileTags(folder: String): [String]
  }
  type Mutation {
    document(data: DocumentInput!): Document
    app(data: AppInput!): App
    file(data: FileInput!): File
  }
`;

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name || 'world'}`,
    // doc
    document: (_, { id }) => findOne('document', id),
    documentList: (_, { type: _type, app: _appId, state = 'PUBLISHED' }) =>
      find('document', { _type, _appId, state }).then(x =>
        x.map(i => ({
          ...i,
          type: i._type,
          nodes: get(i.blocks, 'nodes') || i.nodes,
          text: get(i.blocks, 'text') || i.text,
          extract: get(i.blocks, 'extract') || i.extract
        }))
      ),
    // app
    app: (_, { id }) => findOne('app', id),
    appList: () => find('app'),
    // file
    file: (source, args, { db, app }) =>
      db.collection('file').findOne({ id: args.id }),
    fileList: async (source, { query }, { db, app, user }) => {
      const mongoQuery = {};
      mongoQuery.state = { $ne: 'REMOVED' };
      const all = await db
        .collection('file')
        .find(mongoQuery)
        .toArray();
      all.map(async ({ id, secureUrl, placeholder, pages, ...x }, i) => {
        await updateOne('file', x);
        console.log(i);
      });
      return db
        .collection('file')
        .find(mongoQuery)
        .limit(100)
        .toArray();
    },
    fileTags: (source, { folder }, { db, user }) => {
      if (!user) {
        return [];
      }
      const mongoQuery = {
        // _appId: { $in: user._appIds },
        _type: 'file'
      };
      if (folder) {
        mongoQuery.folder = folder;
      }
      return db
        .collection('item')
        .find(mongoQuery)
        .toArray()
        .then(items =>
          sortBy(uniq(flatMap(items, item => item.tags)), x => x).filter(x => x)
        );
    }
  },
  Mutation: {
    document: (_, { data }) => updateOne('document', data),
    app: (_, { data }) => updateOne('app', data),
    // file
    file: (source, args, { db, app }) => {
      if (args.operationType === 'REMOVE') {
        args.input.state = 'REMOVED';
      }
      return db
        .collection('item')
        .findOne({ id: args.input.id })
        .then(item =>
          /* setTimeout(() => {
            if (args.operationType && args.operationType === 'REMOVE') {
              return updateImage(
                item.publicId,
                args.input.tags,
                args.input.source,
                args.input.caption,
                config,
                true,
              );
            }

            return updateImage(
              item.publicId,
              args.input.tags,
              args.input.source,
              args.input.caption,
              config,
            );
          }, 10); */
          db
            .collection('item')
            .updateOne(
              { id: args.input.id },
              { $set: args.input },
              { upsert: true }
            )
            .then(() => db.collection('item').findOne({ id: args.input.id }))
        );
    }
  }
};

export const { server, playground } = api({
  mongoUri: process.env.MONGODB_URI,
  typeDefs,
  resolvers,
  context: ({ event }) => lambdaHandler(event)
});
