import { findOne, updateOne, find } from 'olymp-api';
import { get, pick } from 'lodash';
import algoliasearch from 'algoliasearch';
import { format } from 'date-fns';

const client = algoliasearch(
  process.env.ALGOLIA_APPLICATION_ID,
  process.env.ALGOLIA_API_KEY
);

const index = client.initIndex('document');
const getDate = (value, f) => {
  console.log(value, f);
  if (!f || !value) {
    return value;
  }
  return format(value, f);
};
export default {
  typeDefs: `
    enum DOCUMENT_STATE {
      DRAFT
      PUBLISHED
      DELETED
    }
    type Document {
      id: ID!
      rev: Int
      revs(limit: Int, skip: Int): [Document]
      createdAt(format: String): DateTime!
      updatedAt(format: String): DateTime!

      type: String
      appId: String
      state: DOCUMENT_STATE

      name: String
      description(maxLength: Int): String
      tags: [String!]!
      image(width: Int, height: Int, format: String): Image
      images(width: Int, height: Int, format: String): [Image]
      color(format: COLOR_FORMAT): String

      raw(fields: [String!]): Json
      adapter: String
      event(format: String): EventData
      nav: NavData
      slate: DocumentContent
      list: ListDocument
      columns: [String]
    }
    type NavData {
      slug: String
      parentId: ID
      parent: Document
      children: [Document]
    }
    type EventData {
      start(format: String): DateTime
      end(format: String): DateTime
      duration(as: String): Int
    }
    type DocumentContent {
      markup(type: String): String
      extract: String
      nodes: [Json!]
      text: String
      toc: [Json!]
    }
    type ListDocument {
      title: String
      subtitle: String
    }
    extend type Query {
      document(id: ID!): Document
      documentList(type: String, app: String, state: DOCUMENT_STATE): [Document]!
    }
    extend type Mutation {
      document(id: ID, data: Json!): Document
    }
  `,
  resolvers: {
    Document: {
      adapter: ({ id }) => 'json',
      list: ({ name, description }) => ({
        title: name,
        subtitle: description
      }),
      image: ({ image }) =>
        image && {
          src: image.url || image.src,
          width: image.width,
          height: image.height,
          crop: image.crop
        },
      raw: (body, { fields }) => (fields ? pick(body, fields) : body),
      event: ({ start, end, date }, { format }) =>
        start || end || date
          ? {
              start: getDate(start || date, format),
              end: getDate(end, format)
            }
          : null
    },
    Query: {
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
        )
    },
    Mutation: {
      document: (_, { data }) =>
        updateOne('document', data).then(item => {
          index.addObject(item);
          return item;
        })
    }
  }
};
