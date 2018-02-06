import React from 'react';
import { SecondarySidebar } from 'olymp-ui/menu/trio';
import { FaSearch } from 'icon88';
import Menu from 'olymp-ui/menu';

export default ({ searchCount, searchTerm, type, id, performSearch }) => (
  <SecondarySidebar
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
  </SecondarySidebar>
);
