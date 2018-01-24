// import App from 'olymp-react';
import React from 'react';
import { plugin as redux } from 'olymp-redux';
import { plugin as auth } from 'olymp-auth';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { plugin as apollo } from 'olymp-apollo';
import { plugin as router, SwitchPathname, Match } from 'olymp-router';
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
const enhance = graphql(
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
);

export default enhance(({ apps }) => (
  <ThemeProvider theme={{ color: '#3A1000' }}>
    <Nav apps={apps}>
      <SwitchPathname>
        <Match match="/" exact render={null} />
        <Match match="/media" exact render={Pages} />
        {apps.map(app => [
          <Match key={app.id} match={`/${app.name}/pages`} component={Pages} />,
          ...(app.schema || []).map(collection => (
            <Match
              key={collection.name}
              match={`/${app.name}/${collection.name}`}
              component={Pages}
            />
          ))
        ])}
      </SwitchPathname>
    </Nav>
  </ThemeProvider>
));
