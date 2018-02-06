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
    type Place {
      description: String,
      id: String,
      placeId: String,
      reference: String
    }
    extend type Query {
      geocode(address: String!, region: String, language: String): Geocode
      geocodeList(address: String!, region: String, language: String): [Geocode]
      place(placeId: String!): Geocode
      places(input: String!, lat: Float, lng: Float, language: String): [Place]
    }
  `,
      resolvers: {
        Query: {
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
          place: (source, { placeId }) => maps.placeById(placeId),
          places: (source, { lat, lng, language, input }) =>
            maps.placesAutoComplete({
              input,
              types: 'address',
              components: { country: 'de' },
              language: language || 'de',
              location:
                lat !== undefined && lng !== undefined
                  ? `${lat},${lng}`
                  : undefined,
              radius: lat !== undefined && lng !== undefined ? 1000 : undefined
            })
        }
      }
    });
