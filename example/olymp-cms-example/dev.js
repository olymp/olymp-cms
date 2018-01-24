const path = require('path');
require('dotenv').config();

const port = parseInt(process.env.PORT, 10);
const auth = {
  AUTH0_CLIENT_ID: 'ZHQ63LtU0ghx9oUDQtG3R9giPOQIxUR7',
  AUTH0_DOMAIN: 'orgilla.eu.auth0.com',
  AUTH0_AUDIENCE: 'default'
};

require('olymp-webpack').dev([
  {
    target: 'web',
    entry: `olymp/dom?${path.resolve(__dirname, 'app')}`,
    plugins: ['olymp-webpack-babel', 'olymp-webpack-less', 'olymp-webpack-pwa'],
    env: {
      ...auth
    },
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
      AUTH0_MANAGEMENT_CLIENT_AUDIENCE: 'https://orgilla.eu.auth0.com/api/v2/',
      AUTH0_MANAGEMENT_CLIENT_ID: 'lVCIlRHrwu3z5mPgCf7wct5OpSs6A2uF',
      AUTH0_MANAGEMENT_CLIENT_SECRET:
        process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
      ...auth
    },
    port: port + 1
  }
]);
