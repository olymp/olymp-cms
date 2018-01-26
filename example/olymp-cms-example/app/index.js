// import App from 'olymp-react';
import React from 'react';
import { plugin as redux } from 'olymp-redux';
import { plugin as auth, getAuth } from 'olymp-auth';
import Error from 'olymp-ui/error';
import { graphql } from 'react-apollo';
import { compose, withPropsOnChange } from 'recompose';
import { get } from 'lodash';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { plugin as apollo } from 'olymp-apollo';
import { ScreenLoader } from 'olymp-ui';
import {
  plugin as router,
  SwitchPathname,
  Match,
  withRouting,
  withPathname
} from 'olymp-router';
import { plugin as fela, ThemeProvider } from 'olymp-fela';
import View from 'olymp-collection/view';
import Mediathek from 'olymp-cloudinary/views';
import Nav from './nav';
import Load from './animated';
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
            color
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
  withPathname,
  withPropsOnChange(['pathname', 'apps'], ({ pathname, apps }) => ({
    app: apps.find(
      x => pathname === `/${x.name}` || pathname.indexOf(`/${x.name}/`) === 0
    )
  })),
  withRouting
);

const pageSchema = {
  label: 'Seite',
  icon: 'page',
  name: 'page',
  fields: {
    name: {
      label: 'Name',
      edit: 'input',
      editProps: {
        min: 1,
        max: 2
      }
    }
  }
};

const baseColor = '#29539E';
const Verifying = connect(({ apollo, location }) => ({
  show:
    (apollo && apollo.initial) ||
    location.pathname === '/login' ||
    location.pathname === '/logout'
}))(p => (
  <ThemeProvider theme={{ color: baseColor }}>
    <ScreenLoader {...p} logo={<Load loading color="white" />} />
  </ThemeProvider>
));

export default enhance(({ apps, pushPathname, app }) => (
  <ThemeProvider
    theme={{
      color: (app && app.color) || baseColor
    }}
  >
    <Nav apps={apps}>
      <Verifying />
      <SwitchPathname key={apps.length}>
        <Match match="/" exact render={null} />
        <Match match="/media" exact render={Pages} />
        {apps.map(app => (
          <Match
            key={app.name}
            match={`/${app.name}/media(/:id)`}
            render={p => (
              <Mediathek
                id={p.id}
                app={app.name}
                onClick={id =>
                  id
                    ? pushPathname(`/${app.name}/media/${id}`)
                    : pushPathname(`/${app.name}/media`)
                }
              />
            )}
          />
        ))}
        {apps.map(app =>
          [pageSchema, ...app.collections].map(collection => (
            <Match
              key={collection.name}
              match={`/${app.name}/${collection.name}(/:id)`}
              render={p => (
                <View
                  id={p.id}
                  collection={collection}
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
        )}
        <Match component={Error} />
      </SwitchPathname>
    </Nav>
  </ThemeProvider>
));
