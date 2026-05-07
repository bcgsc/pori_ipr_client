import React from 'react';
import { StoryFn } from '@storybook/react';
import IPRWYSIWYGEditor, { IPRWYSIWYGEditorProps } from '.';

export default {
  title: 'components/IPRWYSIWYGEditor',
  component: IPRWYSIWYGEditor,
};

const Template = (args) => <IPRWYSIWYGEditor {...args} />;

export const Empty: StoryFn<IPRWYSIWYGEditorProps> = Template.bind({});
Empty.args = {
  isOpen: true,
  text: null,
};

export const WithDefaultText: StoryFn<IPRWYSIWYGEditorProps> = Template.bind({});
WithDefaultText.args = {
  isOpen: true,
  text: 'Default loaded text',
};
