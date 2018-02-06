import React from 'react';
import { Area } from 'olymp-ui/menu/layout';
import { FaSearch } from 'icon88';
import Menu from 'olymp-ui/menu';

export default ({ searchCount, searchTerm, type, id, performSearch }) => (
  <Area
    // width={term ? 600 : 400}
    menu={
      <Menu
        header={[
          <Menu.Item large icon={<FaSearch />}>
            Test
          </Menu.Item>
        ]}
      >
        Hoi
      </Menu>
    }
    placeholder={<span>Code wählen</span>}
    hasContent={!!id}
  >
    Hi
  </Area>
);
