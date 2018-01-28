import React, { Component } from 'react';
import { SecondarySidebar } from 'olymp-ui/menu/trio';
import Menu, { StackedMenu } from 'olymp-ui/menu';
import { createComponent } from 'react-fela';
import {
  FaCube,
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
import { Drawer } from 'olymp-antd/form';
import Table from './table';

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
          name
          raw
          state
          image {
            src
            width
            height
          }
          color
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
          list: item.list,
          color: item.color,
          active: item.id === id,
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
              collection.icon ? <Icon type={collection.icon} /> : <FaCube />
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
        {menuItems.map(({ key, list, image, color, active, onClick }) => (
          <Menu.Item
            key={key}
            onClick={onClick}
            icon={!!image && <Image value={image} width={40} height={40} />}
            active={active}
            large={!!image}
          >
            {color ? <span style={{ color }}>{list.title}</span> : list.title}
            {!!list.subtitle && <small>{list.subtitle}</small>}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  render() {
    const { collection, id, isLoading, keys, items, onClick } = this.props;

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
          <Table {...this.props} />
        </FlexContainer>

        <Drawer
          layout="horizontal"
          collection={collection}
          onClose={() => onClick()}
          item={items.find(x => x.id === id) || {}}
        />
      </SecondarySidebar>
    );
  }
}
