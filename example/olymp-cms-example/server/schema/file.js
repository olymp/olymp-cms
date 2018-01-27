import { findOne, updateOne, find } from 'olymp-api';
import cloudinary from 'cloudinary';

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
      signUpload(folder: String, timestamp: Int!, callback: String, ocr: String): String
      file(id: ID): File
      fileList: [File!]
      fileTags(folder: String): [String]
    }
    extend type Mutation {
      file(id: ID, data: FileInput!, delete: Boolean): File
    }
  `,
  resolvers: {
    Query: {
      signUpload: (source, args, { isAuthenticated }) => {
        if (!isAuthenticated) {
          throw new Error('Not allowed');
        }
        const { signature } = cloudinary.utils.sign_request(args, {
          cloud_name: process.env.CLOUDINARY_CLOUDNAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET
        });
        return signature;
      },
      file: (source, args, { db, app }) =>
        db.collection('file').findOne({ id: args.id }),
      fileList: async (source, {}, { db, app, user }) =>
        db
          .collection('file')
          .find({ state: { $ne: 'REMOVED' } })
          .limit(100)
          .toArray(),
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
      file: (source, { data, id }, { db, app }) => {
        if (args.operationType === 'REMOVE') {
          args.input.state = 'REMOVED';
        }
        return updateOne('file', data);
      }
    }
  }
};
