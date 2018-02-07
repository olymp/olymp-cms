import googleMaps from '@google/maps';
import { get } from 'lodash';

const convertGeocode = result => {
  const newResult = {};
  (result.address_components || []).forEach(component => {
    component.types.forEach(type => {
      const newType = type
        .split('_')
        .map(
          (frag, i) =>
            i > 0 ? `${frag[0].toUpperCase()}${frag.substr(1)}` : frag
        ) // eslint-disable-line
        .join('');
      newResult[newType] = component.long_name;
      newResult[`${newType}Short`] = component.short_name;
    });
  });
  newResult.formattedAddress = result.formatted_address;
  if (result.geometry) {
    if (result.geometry.location) {
      newResult.lat = result.geometry.location.lat;
      newResult.lng = result.geometry.location.lng;
    }
    newResult.locationType = result.geometry.location_type;
  }
  newResult.partialMatch = result.partial_match;
  newResult.id = result.place_id;
  newResult.types = result.types;
  return newResult;
};

export default (!process.env.GOOGLE_MAPS_KEY
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
      geocode(address: String, location: String, language: String): [Geocode]
      place(placeId: String!): Geocode
      places(input: String!, location: String, language: String): [Place]
    }
  `,
      resolvers: {
        Query: {
          geocode: (source, { address, location, language }) =>
            new Promise((yay, nay) => {
              const maps = googleMaps.createClient({
                key: process.env.GOOGLE_MAPS_KEY,
                Promise
              });
              const getResult = (err, result) => {
                if (err) {
                  nay(get(err, 'json.error_message') || err);
                } else {
                  yay(result.json.results.map(convertGeocode));
                }
              };

              if (address)
                maps.geocode(
                  {
                    address,
                    components: { country: 'de' },
                    language: language || 'de',
                    region: 'de'
                  },
                  getResult
                );
              else if (location)
                maps.reverseGeocode(
                  {
                    latlng: location,
                    result_type: 'street_address',
                    language: language || 'de'
                  },
                  getResult
                );
              else getResult('no location or address found!');
            }),
          place: (source, { placeId }) =>
            new Promise((yay, nay) => {
              googleMaps
                .createClient({
                  key: process.env.GOOGLE_MAPS_KEY,
                  Promise
                })
                .place({ placeid: placeId }, (err, result) => {
                  if (err) {
                    nay(err.json.error_message);
                  } else {
                    yay(
                      result.json.result
                        ? convertGeocode(result.json.result)
                        : null
                    );
                  }
                });
            }),
          places: (source, { location, language, input }) =>
            new Promise((yay, nay) => {
              googleMaps
                .createClient({
                  key: process.env.GOOGLE_MAPS_KEY,
                  Promise
                })
                .placesAutoComplete(
                  {
                    input,
                    types: 'address',
                    components: { country: 'de' },
                    language: language || 'de',
                    location,
                    radius: location !== undefined ? 1000 : undefined
                  },
                  (err, result) => {
                    if (err) {
                      nay(err.json.error_message);
                    } else {
                      yay(
                        result.json.predictions.map(
                          ({
                            description,
                            id,
                            place_id: placeId,
                            reference
                          }) => ({
                            description,
                            id,
                            placeId,
                            reference
                          })
                        )
                      );
                    }
                  }
                );
            })
        }
      }
    });
