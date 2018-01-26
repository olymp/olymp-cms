const path = require('path');
require('dotenv').config();

const port = parseInt(process.env.PORT, 10);
const env = {
  // Auth
  AUTH0_CLIENT_ID: 'ZHQ63LtU0ghx9oUDQtG3R9giPOQIxUR7',
  AUTH0_DOMAIN: 'orgilla.eu.auth0.com',
  AUTH0_AUDIENCE: 'default',
  // Algolia
  ALGOLIA_SEARCH_KEY: '59b70768438dbd48664400d5854c6c00',
  ALGOLIA_APPLICATION_ID: 'RDGON4FSOY',
  // Cloudinary
  CLOUDINARY_CLOUDNAME: 'djyenzorc',
  CLOUDINARY_API_KEY: '179442986443332'
};

require('olymp-webpack').dev([
  {
    target: 'web',
    entry: `olymp/dom?${path.resolve(__dirname, 'app')}`,
    plugins: ['olymp-webpack-babel', 'olymp-webpack-less', 'olymp-webpack-pwa'],
    env,
    proxy: {
      '/graphql': `http://localhost:${port + 1}`
    },
    static: path.resolve(__dirname, 'public'),
    port
  },
  {
    entry: `olymp-webpack-lambda/entry?${path.resolve(__dirname, 'server')}`,
    target: 'lambda',
    plugins: ['olymp-webpack-babel', 'olymp-webpack-lambda'],
    env: {
      MONGODB_URI: process.env.MONGODB_URI,
      ALGOLIA_API_KEY: process.env.ALGOLIA_API_KEY,
      AUTH0_MANAGEMENT_CLIENT_ID: 'fRrvAhViv1QXxcWvxmUpLZJLPzEdQ5f8',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
      AUTH0_MANAGEMENT_CLIENT_SECRET:
        process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
      ...env
    },
    port: port + 1
  }
]);
