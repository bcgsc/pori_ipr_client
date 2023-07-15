import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import IPRWYSIWYGEditor, { IPRWYSIWYGEditorProps } from '.';

export default {
  title: 'components/IPRWYSIWYGEditor',
  component: IPRWYSIWYGEditor,
};

const Template = (args) => <IPRWYSIWYGEditor {...args} />;

export const Empty: Story<IPRWYSIWYGEditorProps> = Template.bind({});
Empty.args = {
  isOpen: true,
  text: null,
};

export const WithDefaultText: Story<IPRWYSIWYGEditorProps> = Template.bind({});
WithDefaultText.args = {
  isOpen: true,
  text: 'Default loaded text',
};
