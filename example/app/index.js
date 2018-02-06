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
import { ScreenLoader, ColorsProvider } from 'olymp-ui';
import {
  plugin as router,
  SwitchPathname,
  Match,
  withRouting,
  withPathname
} from 'olymp-router';
import { plugin as fela, ThemeProvider } from 'olymp-fela';
import withLocale from 'olymp-antd/de';
import View from 'olymp-collection/view';
import Mediathek from 'olymp-cloudinary/views';
import Nav from './nav';
import Load from './animated';
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
  withLocale({}),
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
  icon: 'file',
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
    <ColorsProvider palette={7}>
      <Nav apps={apps}>
        <Verifying />
        <SwitchPathname key={apps.length}>
          <Match match="/" exact render={null} />
          <Match
            match="/media"
            exact
            render={p => (
              <Mediathek
                id={p.id}
                onClick={id =>
                  id ? pushPathname(`/media/${id}`) : pushPathname(`/media`)
                }
              />
            )}
          />

          {apps.map(a => (
            <Match
              key={a.name}
              match={`/${a.name}/collections(/:collectionsString)`}
              render={() => (
                <View
                  collections={[pageSchema, ...a.collections]}
                  app={a.name}
                />
              )}
            />
          ))}
          <Match component={Error} />
        </SwitchPathname>
      </Nav>
    </ColorsProvider>
  </ThemeProvider>
));
