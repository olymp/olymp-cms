import React, { Fragment } from 'react';
import Menu from 'olymp-ui/menu';
import {
  FaSearch,
  FaPowerOff,
  FaCog,
  FaImage,
  FaBook,
  FaCubes,
  FaCalendar,
  FaDatabase
} from 'icon88';
import { Avatar } from 'olymp-ui';
import { getAuth } from 'olymp-auth';
import Layout from 'olymp-ui/menu/layout';
import { compose, withState } from 'recompose';
import { withRouting } from 'olymp-router';
import Search from './search';
import Logo from './logo';

const enhance = compose(
  withState('searchText', 'setSearchText', null),
  getAuth,
  withRouting
);
export default enhance(
  ({
    login,
    logout,
    pushPathname,
    pathname = '',
    user,
    children,
    searchText,
    setSearchText,
    apps
  }) => (
    <Layout
      color
      inverted
      header={
        <Menu.Item large icon={<Logo color="white" />}>
          Olymp
        </Menu.Item>
      }
      menu={
        <Fragment>
          <Menu.Item
            active={pathname === '/'}
            icon={<FaCubes />}
            onClick={() => pushPathname('/')}
          >
            Dashboard
          </Menu.Item>
          <Menu.Item
            active={pathname === `/media`}
            icon={<FaImage />}
            onClick={() => pushPathname(`/media`)}
          >
            Mediathek
          </Menu.Item>
          <Menu.Item
            active={pathname === `/calendar`}
            icon={<FaCalendar />}
            onClick={() => pushPathname(`/calendar`)}
          >
            Kalender
          </Menu.Item>
          <Menu.Item
            active={pathname === `/data`}
            icon={<FaDatabase />}
            onClick={() => pushPathname(`/data`)}
          >
            Datenbank
          </Menu.Item>

          {apps &&
            !!apps.length && (
              <Fragment>
                <Menu.Divider />

                <div style={{ overflow: 'auto' }}>
                  {apps.map(app => (
                    <Menu.List title={app.name} key={app.id} extra={<FaCog />}>
                      <Menu.Item
                        active={pathname === `/${app.name}/page`}
                        icon={<FaBook />}
                        onClick={() =>
                          pushPathname(`/${app.name}/collections/page`)
                        }
                      >
                        Seiten
                      </Menu.Item>
                      {app.collections.map(collection => (
                        <Menu.Item
                          key={collection.name}
                          active={pathname === '/'}
                          icon={<FaBook />}
                          onClick={() =>
                            pushPathname(
                              `/${app.name}/collections/${collection.name}`
                            )
                          }
                        >
                          {collection.label}
                        </Menu.Item>
                      ))}
                    </Menu.List>
                  ))}
                </div>

                <Menu.Divider />
              </Fragment>
            )}

          <Menu.Space />

          <Menu.Item onClick={() => setSearchText('')} icon={<FaSearch />}>
            Suche
          </Menu.Item>
          {user && (
            <Menu.Item
              onClick={logout}
              icon={
                <Avatar
                  email={user.email || 'diego'}
                  name={user.name}
                  default="blank"
                />
              }
            >
              {user.name}
            </Menu.Item>
          )}
          {!user && (
            <Menu.Item onClick={() => login()} icon={<FaPowerOff />}>
              Anmelden
            </Menu.Item>
          )}
          {user && (
            <Menu.Item onClick={logout} icon={<FaPowerOff />}>
              Abmelden
            </Menu.Item>
          )}
        </Fragment>
      }
    >
      {children}
      <Search
        placeholder="Suche ..."
        value={searchText}
        onChange={setSearchText}
        open={searchText !== null && searchText !== undefined}
        header={
          <Menu.Item large icon={<Logo color />} onClick={() => setQuery({})}>
            Olymp
          </Menu.Item>
        }
        results={
          searchText
            ? [
                { id: 1, name: 'Test 1' },
                { id: 2, name: 'Test 2' },
                { id: 3, name: 'Test 3' }
              ]
            : []
        }
        onClose={() => {
          setSearchText(null);
        }}
      />
    </Layout>
  )
);
