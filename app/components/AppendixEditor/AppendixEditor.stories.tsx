import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import AppendixEditor, { AppendixEditorProps } from '.';

export default {
  title: 'components/AppendixEditor',
  component: AppendixEditor,
};

const Template = (args) => <AppendixEditor {...args} />;

export const Empty: Story<AppendixEditorProps> = Template.bind({});
Empty.args = {
  isOpen: true,
  text: null,
};

export const WithDefaultText: Story<AppendixEditorProps> = Template.bind({});
WithDefaultText.args = {
  isOpen: true,
  text: 'Default loaded text',
};
