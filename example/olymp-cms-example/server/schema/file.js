import { findOne, updateOne, find } from 'olymp-api';

export default {
  typeDefs: `
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
    extend type Query {
      file(id: ID): File
      fileList: [File!]
      fileTags(folder: String): [String]
    }
    extend type Mutation {
      file(data: FileInput!): File
    }
  `,
  resolvers: {
    Query: {
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
            sortBy(uniq(flatMap(items, item => item.tags)), x => x).filter(
              x => x
            )
          );
      }
    },
    Mutation: {
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
  }
};
