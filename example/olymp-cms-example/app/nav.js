import React from 'react';
import Menu from 'olymp-ui/menu';
import { FaSearch, FaPowerOff, FaCog, FaImage, FaBook, FaCubes } from 'icon88';
import { Avatar } from 'olymp-ui';
import { getAuth } from 'olymp-auth';
import Sidebar from 'olymp-ui/menu/trio';
import { compose, withState } from 'recompose';
import { withRouting } from 'olymp-router';
import Search from './search';
import Logo from './logo';

const enhance = compose(
  withState('collapsed', 'setCollapsed', true),
  withState('searchText', 'setSearchText', null),
  getAuth,
  withRouting
);
export default enhance(
  ({
    login,
    logout,
    pushPathname,
    collapsed = true,
    setCollapsed,
    pathname = '',
    user,
    children,
    searchText,
    setSearchText,
    apps
  }) => (
    <Sidebar
      collapsed={collapsed}
      setCollapsed={setCollapsed}
      menu={
        <Menu
          color
          inverted
          header={
            <Menu.Item large icon={<Logo color="white" />}>
              Manager
            </Menu.Item>
          }
        >
          <Menu.Item
            active={pathname === '/'}
            icon={<FaCubes />}
            onClick={() => pushPathname('/')}
          >
            Dashboard
          </Menu.Item>
          {apps.map(app => (
            <Menu.List title={app.name} key={app.id} extra={<FaCog />}>
              <Menu.Item
                active={pathname === '/media'}
                icon={<FaImage />}
                onClick={() => pushPathname('/media')}
              >
                Mediathek
              </Menu.Item>
              <Menu.Item
                active={pathname === `/${app.name}/page`}
                icon={<FaBook />}
                onClick={() => pushPathname(`/${app.name}/page`)}
              >
                Seiten
              </Menu.Item>
              {app.collections.map(collection => (
                <Menu.Item
                  key={collection.name}
                  active={pathname === '/'}
                  icon={<FaBook />}
                  onClick={() =>
                    pushPathname(`/${app.name}/${collection.name}`)
                  }
                >
                  {collection.label}
                </Menu.Item>
              ))}
            </Menu.List>
          ))}
          <Menu.Space />
          <Menu.Item
            onClick={() => {
              setSearchText('');
              setCollapsed(true);
            }}
            icon={<FaSearch />}
          >
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
        </Menu>
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
            Diego <strong>ONE</strong>
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
    </Sidebar>
  )
);
