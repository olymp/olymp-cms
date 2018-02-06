import React, { Component } from 'react';
import { Area } from 'olymp-ui/menu/layout';
import Menu from 'olymp-ui/menu';
import { FaCube, FaTrashO, FaArchive, FaClockO, FaEye } from 'olymp-icons';
import { Icon } from 'antd';
import { compose, withPropsOnChange, withState, withProps } from 'recompose';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Drawer } from 'olymp-antd/form';
import { get } from 'lodash';
import Calendar from 'olymp-ui/calendar';
import { withRouting } from 'olymp-router';
import { isAfter } from 'date-fns';
import Table from './table';

const enhance = compose(
  withRouting,
  withState('states', 'setStates', ['PUBLISHED']),
  withState('date', 'setDate', new Date()),
  withState('edit', 'setEdit'),
  withPropsOnChange(['collectionsString'], ({ collectionsString }) => ({
    selected: collectionsString.split(',')
  })),
  withProps(({ pushPathname, app, selected, states, setStates }) => ({
    onSelectCollection: (e, name) => {
      if (e.shiftKey) {
        let newSelected;

        if (selected.includes(name)) {
          newSelected = selected.filter(k => k !== name);
        } else {
          newSelected = [...selected, name];
        }
        if (!newSelected.length) newSelected = selected;

        pushPathname(`/${app}/collections/${newSelected.join(',')}`);
      } else {
        pushPathname(`/${app}/collections/${name}`);
      }
    },
    onSelectState: (e, state) => {
      if (e.shiftKey) {
        let newStates;

        if (states.includes(state)) {
          newStates = states.filter(k => k !== state);
        } else {
          newStates = [...states, state];
        }
        if (!newStates.length) newStates = ['PUBLISHED'];

        setStates(newStates);
      } else {
        setStates([state]);
      }
    }
  })),
  graphql(
    gql`
      query documentList($type: [String], $app: String) {
        documentList(type: $type, app: $app) {
          id
          type
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
      options: ({ selected, app }) => ({
        variables: {
          type: selected,
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
  withPropsOnChange(['items'], ({ items = [], date }) => ({
    items: items.map(
      item =>
        item.event
          ? {
              ...item,
              state:
                item.state === 'PUBLISHED' &&
                !!item.event.end &&
                !isAfter(item.event.end, new Date(date))
                  ? 'EXPIRED'
                  : 'PUBLISHED'
            }
          : item
    )
  }))
);

@enhance
export default class CollectionView extends Component {
  render() {
    const {
      collections,
      selected,
      states,
      items,
      date,
      setDate,
      edit,
      setEdit,
      onSelectCollection,
      onSelectState
    } = this.props;
    const editItem = items.find(x => x.id === edit) || {};

    console.log(this.props);

    return (
      <Area
        width={240}
        menu={
          <Menu>
            <Calendar value={date} onChange={setDate} />

            <Menu.Divider />

            <Menu.Item
              icon={<FaEye />}
              onClick={e => onSelectState(e, 'PUBLISHED')}
              active={states.includes('PUBLISHED')}
            >
              Veröffentlicht
            </Menu.Item>
            <Menu.Item
              icon={<FaClockO />}
              subtitle="Nur für Events"
              onClick={e => onSelectState(e, 'EXPIRED')}
              active={states.includes('EXPIRED')}
            >
              Abgelaufen
            </Menu.Item>
            <Menu.Item
              icon={<FaArchive />}
              onClick={e => onSelectState(e, 'DRAFT')}
              active={states.includes('DRAFT')}
            >
              Archiv
            </Menu.Item>
            <Menu.Item
              icon={<FaTrashO />}
              onClick={e => onSelectState(e, 'REMOVED')}
              active={states.includes('REMOVED')}
            >
              Papierkorb
            </Menu.Item>

            <Menu.Divider />

            <div style={{ overflow: 'auto' }}>
              {collections.map(c => (
                <Menu.Item
                  key={c.name}
                  onClick={e => onSelectCollection(e, c.name)}
                  icon={c.icon ? <Icon type={c.icon} /> : <FaCube />}
                  active={selected.includes(c.name)}
                  subtitle={!!get(c, 'mapping.event') && 'Event'}
                >
                  {c.label}
                </Menu.Item>
              ))}
            </div>
          </Menu>
        }
      >
        <Table
          collections={collections.filter(c => selected.includes(c.name))}
          states={states}
          items={items}
          onClick={id => setEdit(id)}
        />

        <Drawer
          layout="horizontal"
          title={get(editItem, 'list.title')}
          schema={collections.find(c => c.name === editItem.type) || {}}
          value={editItem.raw || {}}
          onChange={console.log}
          onClose={() => setEdit()}
        />
      </Area>
    );
  }
}
