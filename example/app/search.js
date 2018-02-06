import React, { Component } from 'react';
import Drawer from 'olymp-ui/drawer';
import Menu from 'olymp-ui/menu';
import { createComponent } from 'react-fela';
// import { Menu } from 'semantic-ui-react';
import { FaSearch, FaFile } from 'olymp-icons';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch/dom';
import 'react-instantsearch-theme-algolia/style.min.css';

const SearchMenu = createComponent(
  ({ theme }) => ({
    '& input': {
      backgroundColor: 'transparent',
      border: 0,
      color: theme.inverted ? theme.light2 : theme.dark2,
      fontSize: '1.4em',
      outline: 0,
      fontStyle: 'italic',
      width: '100%'
    }
  }),
  p => <Menu {...p} />,
  p => Object.keys(p)
);

const SearchItem = ({ hit, onClick }) => (
  <Menu.Item key={hit.id} onClick={onClick} icon={hit.icon || <FaFile />}>
    {hit.name}
  </Menu.Item>
);

export default class SearchDrawer extends Component {
  componentWillReceiveProps({ open }) {
    if (open && !this.props.open && this.input) {
      this.input.focus();
    }
  }
  render() {
    const { open, onClose, placeholder, header } = this.props;
    return (
      <InstantSearch
        appId={process.env.ALGOLIA_APPLICATION_ID}
        apiKey={process.env.ALGOLIA_SEARCH_KEY}
        indexName="document"
      >
        <Drawer
          color="white"
          open={open}
          onClose={() => {
            onClose();
          }}
        >
          <Menu color="white" collapsed header={header}>
            <Menu.Item onClick={onClose} icon={<FaSearch />} />
          </Menu>
          <SearchMenu color="white">
            <SearchBox
              translations={{ placeholder: placeholder || 'Suchtext ...' }}
              __inputRef={x => (this.input = x)}
            />
            <Hits hitComponent={SearchItem} />
          </SearchMenu>
        </Drawer>
      </InstantSearch>
    );
  }
}
/*

            <Input
              innerRef={x => (this.input = x)}
              placeholder={placeholder}
              value={value || ''}
              onChange={e => onChange(e.target.value)}
            />
*/
