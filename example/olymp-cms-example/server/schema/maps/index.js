import createMaps from './util';

const maps =
  process.env.GOOGLE_MAPS_KEY && createMaps(process.env.GOOGLE_MAPS_KEY);

export default (!maps
  ? {}
  : {
      typeDefs: `
    type Geocode {
      id: String
      streetNumber: String
      route: String
      locality: String
      administrativeAreaLevel1: String
      administrativeAreaLevel2: String
      country: String
      postalCode: String
      formattedAddress: String
      lat: Float
      lng: Float
      locationType: String
      partialMatch: Boolean
      types: [String]
    }
    type PlaceAutoComplete {
      description: String,
      id: String,
      placeId: String,
      reference: String
    }
    extend type Query {
      place(placeId: String!): Geocode
      geocode(address: String!, region: String, language: String): Geocode
      geocodeList(address: String!, region: String, language: String): [Geocode]
      places(input: String!, lat: Float, lng: Float, language: String): [PlaceAutoComplete]
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
        Query: {
          place: (source, args) => maps.placeById(args.placeId),
          geocode: (source, args) =>
            maps
              .geocode({
                ...args,
                components: { country: 'DE' }
              })
              .then(result => result[0]),
          geocodeList: (source, args) =>
            maps.geocode({
              ...args,
              components: { country: 'DE' }
            }),
          places: (source, { lat, lng, language, ...args }) =>
            maps.placesAutoComplete({
              ...args,
              types: 'address',
              language: language || 'de',
              components: { country: 'de' },
              location:
                lat !== undefined && lng !== undefined
                  ? `${lat},${lng}`
                  : undefined,
              radius: lat !== undefined && lng !== undefined ? 1000 : undefined
            })
        }
      }
    });
