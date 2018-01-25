import React, { Component } from 'react';
import { Drawer } from 'olymp-ui';
import { SecondarySidebar } from 'olymp-ui/menu/trio';
import Menu, { StackedMenu } from 'olymp-ui/menu';
import { createComponent } from 'react-fela';
import {
  FaDatabase,
  FaTrashO,
  FaArchive,
  FaClockO,
  FaPlus,
  FaAngleRight,
  FaChevronLeft
} from 'olymp-icons';
import { Image } from 'olymp-cloudinary';
import { get } from 'lodash';
import { Icon } from 'antd';
import { compose, withPropsOnChange, withState } from 'recompose';
import isAfter from 'date-fns/isAfter';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import Calendar from './calendar';
import Table from './table';
import Detail from './detail';

const FlexContainer = createComponent(
  ({ theme }) => ({
    position: 'relative',
    hasFlex: {
      display: 'flex',
      flex: '1 1 0%',
      flexDirection: 'column'
    },
    '> .rbc-calendar': {
      padding: theme.space3
    },
    '> div': {
      hasFlex: {
        flex: '1 1 0%'
      },
      height: 'auto !important',
      overflow: 'auto',
      '> .rbc-toolbar': {
        '> .rbc-toolbar-label': {
          color: theme.color,
          fontWeight: 200,
          fontSize: '200%'
        }
      }
    }
  }),
  'div'
);

const enhance = compose(
  withState('keys', 'setKeys', []),
  graphql(
    gql`
      query documentList($type: String, $app: String) {
        documentList(type: $type, app: $app) {
          id
          raw
          state
          event {
            start
            end
            allDay
          }
          list {
            title
            subtitle
          }
        }
      }
    `,
    {
      options: ({ collection, app }) => ({
        variables: {
          type: collection.name,
          app
        }
      }),
      props: ({ ownProps, data }) => ({
        ...ownProps,
        loading: data.loading,
        items: data.documentList || []
      })
    }
  ),
  withPropsOnChange(['items'], ({ items = [] }) => {
    const startField = null;
    const endField = null;
    return {
      collection: {
        label: 'Neuigkeit',
        icon: 'FaPenicl',
        name: 'news',
        mapping: {
          description: 'pfarrer.name',
          event: {
            start: 'datum'
          },
          list: {
            title: 'name',
            subtitle: 'name'
          }
        },
        columns: ['name', 'pfarrer.name'],
        fields: {
          start: {
            label: 'Name',
            edit: 'date',
            editProps: {
              min: 1,
              max: 2
            }
          },
          name: {
            label: 'Name',
            edit: 'input',
            editProps: {
              min: 1,
              max: 2
            }
          },
          pfarrer: {
            label: 'Pfarrer',
            edit: 'rel',
            editProps: {
              to: '#user.pfarrer'
            }
          }
        }
      },
      items: startField
        ? items.map(item => ({
            ...item,
            state:
              item.state === 'PUBLISHED' &&
              !isAfter(item[endField || startField], new Date())
                ? 'EXPIRED'
                : 'PUBLISHED'
          }))
        : items
    };
  }),
  withPropsOnChange(
    ['items', 'id', 'keys'],
    ({ items = [], onClick, id, keys }) => ({
      menuItems: items
        .filter(x => x.state === (keys[0] || 'PUBLISHED'))
        .map(item => ({
          key: item.id,
          image: item.image,
          description: item.description,
          color: item.color,
          active: item.id === id,
          label: item.name,
          onClick: () => onClick(item.id)
        }))
    })
  )
);

@enhance
export default class CollectionView extends Component {
  renderMenu = () => {
    const { collection, menuItems, updateQuery, keys, setKeys } = this.props;
    const isEvent = !!get(collection, 'mapping.event');

    return (
      <Menu
        header={
          <Menu.Item
            icon={
              collection.icon ? (
                <Icon type={collection.icon} style={{ fontSize: 32 }} />
              ) : (
                <FaDatabase />
              )
            }
            large
            extra={
              <Menu.Extra
                onClick={() =>
                  updateQuery({ [`@${collection.name.toLowerCase()}`]: 'new' })
                }
                disabled={!!keys.length}
                large
              >
                <FaPlus />
              </Menu.Extra>
            }
          >
            {collection.label}
          </Menu.Item>
        }
      >
        {!!keys.length && (
          <Menu.Item icon={<FaChevronLeft />} onClick={() => setKeys([])}>
            Zurück
          </Menu.Item>
        )}
        {!keys.length &&
          !!isEvent && (
            <Menu.Item
              icon={<FaClockO />}
              extra={<FaAngleRight />}
              onClick={() => setKeys(['EXPIRED'])}
            >
              Abgelaufen
            </Menu.Item>
          )}
        {!keys.length && (
          <Menu.Item
            icon={<FaArchive />}
            extra={<FaAngleRight />}
            onClick={() => setKeys(['DRAFT'])}
          >
            Archiv
          </Menu.Item>
        )}
        {!keys.length && (
          <Menu.Item
            icon={<FaTrashO />}
            extra={<FaAngleRight />}
            onClick={() => setKeys(['REMOVED'])}
          >
            Papierkorb
          </Menu.Item>
        )}
        <Menu.Divider />
        {menuItems.map(
          ({ key, label, description, image, color, active, onClick }) => (
            <Menu.Item
              key={key}
              onClick={onClick}
              icon={!!image && <Image value={image} width={40} height={40} />}
              active={active}
              large={!!image}
            >
              {color ? <span style={{ color }}>{label}</span> : label}
              {!!description && <small>{description}</small>}
            </Menu.Item>
          )
        )}
      </Menu>
    );
  };

  render() {
    const {
      collection,
      fieldNames,
      id,
      refetchQuery,
      isLoading,
      keys,
      items,
      onClick
    } = this.props;
    const isEvent = !!get(collection, 'mapping.event');
    const activeItem = items.find(x => x.id === id) || {};

    return (
      <SecondarySidebar
        width={240}
        menu={
          <StackedMenu
            isLoading={isLoading}
            keys={keys}
            renderMenu={this.renderMenu}
          />
        }
      >
        <FlexContainer>
          {isEvent ? (
            <Calendar {...this.props} />
          ) : (
            <Table
              {...this.props}
              items={items.filter(x => x.state === (keys[0] || 'PUBLISHED'))}
            />
          )}
        </FlexContainer>

        <Drawer open={!!id} width={475} right onClose={() => onClick()}>
          <Menu
            header={
              id === 'new' ? (
                <Menu.Item large>{collection.label} anlegen</Menu.Item>
              ) : (
                <Menu.Item large>
                  {get(activeItem, 'list.title')}
                  <small>{collection.label} bearbeiten</small>
                </Menu.Item>
              )
            }
            headerColor
            headerInverted
          >
            <Detail
              id={id === 'new' ? null : id}
              key={id || 'new'}
              refetchQuery={refetchQuery}
              fieldNames={fieldNames}
              collection={collection}
            />
          </Menu>
        </Drawer>
      </SecondarySidebar>
    );
  }
}
