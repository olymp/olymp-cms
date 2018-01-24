// import App from 'olymp-react';
import React from 'react';
import { plugin as redux } from 'olymp-redux';
import { plugin as auth } from 'olymp-auth';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';
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
  graphql(
    gql`
      query appList {
        appList {
          id
          name
          schema
        }
      }
    `,
    {
      options: ({ id }) => ({}),
      props: ({ ownProps, data }) => ({
        ...ownProps,
        apps: data.appList || [],
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
          ...[
            {
              name: 'news'
            }
          ].map(type => (
            <Match
              key={type.name}
              match={`/${app.name}/${type.name}(/:id)`}
              render={p => (
                <View
                  id={p.id}
                  typeName={type.name}
                  app={app.name}
                  onClick={id =>
                    id
                      ? pushPathname(`/${app.name}/${type.name}/${id}`)
                      : pushPathname(`/${app.name}/${type.name}`)
                  }
                />
              )}
            />
          ))
        ])}
      </SwitchPathname>
    </Nav>
  </ThemeProvider>
));
