import React, { Component } from 'react';
import { createComponent } from 'react-fela';
import { Table, Input } from 'antd';
import { uniq } from 'lodash';
import { compose, withPropsOnChange, withState } from 'recompose';
import isAfter from 'date-fns/isAfter';

const StyledTable = createComponent(
  ({ theme }) => ({
    borderLeft: `1px solid ${theme.dark4}`,
    '& .ant-table-thead > tr > th': {
      backgroundColor: '#F4F5F7'
    },
    '& thead > tr': {
      height: 80,
      '& th': {
        fontSize: '115%',
        fontWeight: 300
      }
    },
    '& td': {
      minWidth: 50,
      maxWidth: 200
    },
    '& .ant-pagination': {
      margin: theme.space3
    }
  }),
  p => <Table {...p} />,
  p => Object.keys(p)
);

const sortValue = (item, collection) => {
  console.log(item, collection);
  /* if (item.name === (collection.specialFields.imageField || 'image' || 'bild'))
    return 50;

  if (item.name === (collection.specialFields.nameField || 'name')) return 40;

  if (
    item.name ===
    (collection.specialFields.descriptionField ||
      'description' ||
      'beschreibung')
  )
    return 30;

  if (item.name === (collection.specialFields.colorField || 'color' || 'farbe'))
    return 20;

  return parseInt(item.specialFields.table, 10) || 10; */
};

const getSorter = field =>
  (field.innerType.name === 'String' &&
    ((a, b) => {
      const nameA = (a[field.name] || '').toUpperCase();
      const nameB = (b[field.name] || '').toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      return 0;
    })) ||
  (field.innerType.name === 'Int' &&
    ((a, b) => b[field.name] - a[field.name])) ||
  (field.innerType.name === 'Date' &&
    ((a, b) => (isAfter(a[field.name], b[field.name]) ? 1 : -1))) ||
  (field.innerType.name === 'Bool' &&
    ((a, b) => (a[field.name] && !b[field.name] ? 1 : -1)));

const getFilters = (items, field) => {
  if (field.type.kind === 'ENUM' || field.type.kind === 'LIST') {
    const arr = items.map(item => item[field.name]);

    return uniq(arr)
      .map(x => ({
        text: getPrintableValue(x, field),
        value: x
      }))
      .filter(x => x.value);
  }

  return undefined;
};

const enhance = compose(
  withState('activeFilter', 'setActiveFilter'),
  withState('filter', 'setFilter', {}),
  withPropsOnChange(
    ['collection'],
    ({ collection }) =>
      console.log(collection) || {
        columns: (collection.columns || Object.keys(collection.fields))
          // .sort((a, b) => sortValue(b, collection) - sortValue(a, collection))
          .map(fieldName => {
            const name = fieldName.split('.')[0];

            return {
              key: name,
              title: collection.fields[name].label,
              dataIndex: name,
              // sorter: getSorter(field),
              // filters: getFilters(items, field),
              /* filterDropdown: field.innerType.name === 'String' && (
              <Input
                placeholder="Filter"
                value={filter[field.name] ? filter[field.name] : ''}
                onChange={e =>
                  setFilter({ ...filter, [field.name]: e.target.value })
                }
                onPressEnter={() => setActiveFilter()}
              />
            ),
            filterDropdownVisible: activeFilter === field.name,
            onFilterDropdownVisibleChange: visible =>
              setActiveFilter(visible && field.name),
            onFilter: (value, item) => item[field.name] === value, */
              render: value => value
            };
          })
      }
  ),
  withPropsOnChange(['items', 'filter'], ({ items, filter }) => ({
    data: items
      .filter(item =>
        Object.keys(filter).reduce(
          (acc, key) =>
            acc &&
            item[key].toLowerCase().indexOf(filter[key].toLowerCase()) !== -1,
          true
        )
      )
      .map((item, i) => ({
        key: i,
        ...item
      }))
  }))
);

@enhance
export default class CollectionView extends Component {
  render() {
    const { columns, data, onClick } = this.props;

    return (
      <StyledTable
        columns={columns}
        dataSource={data}
        onRow={({ id }) => ({ onClick: () => onClick(id) })}
      />
    );
  }
}
