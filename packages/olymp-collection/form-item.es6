import React from 'react';
import Form, { layout } from 'olymp-antd/form';
import { createComponent } from 'react-fela';
import { get } from 'lodash';

const Div = createComponent(
  ({ theme }) => ({
    paddingY: theme.space2,
    paddingX: theme.space2,
    '> div.ant-form-item.ant-row.ant-form-item.ant-form-item-no-colon': {
      marginBottom: 0
    }
  }),
  'div',
  ['onClick']
);

export default ({ children, field, ...props }) => {
  const label = get(field, 'specialFields.label');

  return (
    <Div>
      <Form.Item {...layout} {...props} label={label}>
        {children}
      </Form.Item>
    </Div>
  );
};
