import React from 'react';
import { toClass } from 'recompose';
import { Input } from 'antd';
import FormItem from './form-item';

export default {
  rule: ({ innerType }) => innerType.name === 'Color',
  form: toClass(({ type, ...props }) => (
    <FormItem {...props}>
      <Input {...props} />
    </FormItem>
  ))
};
