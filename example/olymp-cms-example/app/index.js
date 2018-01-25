// import App from 'olymp-react';
import React from 'react';
import { plugin as redux } from 'olymp-redux';
import { plugin as auth, getAuth } from 'olymp-auth';
import Error from 'olymp-ui/error';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
import { get } from 'lodash';
import gql from 'graphql-tag';
import { plugin as apollo } from 'olymp-apollo';
import {
  plugin as router,
  SwitchPathname,
  Match,
  withRouting
} from 'olymp-router';
import { plugin as fela, ThemeProvider } from 'olymp-fela';
import View from 'olymp-collection/view';
import Nav from './nav';
import Pages from './pages';
// import Logo from 'olymp-fela/logo';

export const plugins = [
  redux(),
  apollo(),
  router(),
  fela(),
  auth({
    scope: 'openid email profile access'
  })
];

// #3A1000
const enhance = compose(
  getAuth,
  graphql(
    gql`
      query user($id: ID!) {
        user(id: $id) {
          id
          email
          name
          apps {
            id
            name
            collections
          }
        }
      }
    `,
    {
      options: ({ user = {} }) => ({
        fetchPolicy: !get(user, 'sub') ? 'cache-only' : undefined,
        variables: { id: get(user, 'sub') }
      }),
      props: ({ ownProps, data }) => ({
        ...ownProps,
        user: data.user,
        apps: get(data, 'user.apps') || [],
        data
      })
    }
  ),
  withRouting
);

export default enhance(({ apps, pushPathname }) => (
  <ThemeProvider theme={{ color: '#3A1000' }}>
    <Nav apps={apps} key={apps.length}>
      <SwitchPathname>
        <Match match="/" exact render={null} />
        <Match match="/media" exact render={Pages} />
        {apps.map(app => [
          <Match
            key={app.id}
            match={`/${app.name}/pages(/:id)`}
            render={p => (
              <View
                id={p.id}
                typeName="page"
                app={app.name}
                onClick={id =>
                  id
                    ? pushPathname(`/${app.name}/pages/${id}`)
                    : pushPathname(`/${app.name}/pages`)
                }
              />
            )}
          />,
          ...app.collections.map(collection => (
            <Match
              key={collection.name}
              match={`/${app.name}/${collection.name}(/:id)`}
              render={p => (
                <View
                  id={p.id}
                  typeName={collection.name}
                  app={app.name}
                  onClick={id =>
                    id
                      ? pushPathname(`/${app.name}/${collection.name}/${id}`)
                      : pushPathname(`/${app.name}/${collection.name}`)
                  }
                />
              )}
            />
          ))
        ])}
        <Match component={Error} />
      </SwitchPathname>
    </Nav>
  </ThemeProvider>
));
