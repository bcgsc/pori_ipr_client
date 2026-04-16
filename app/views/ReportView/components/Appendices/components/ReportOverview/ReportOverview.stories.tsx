import React from 'react';
import { StoryFn } from '@storybook/react';
import ReportOverview, { ReportOverviewProps } from '.';

export default {
  title: 'components/ReportOverview',
  component: ReportOverview,
};

const Template = (args) => <ReportOverview {...args} />;

export const CannotEdit: StoryFn<ReportOverviewProps> = Template.bind({});
CannotEdit.args = {
  canEdit: false,
  isNew: false,
  templateId: '123456-uuid',
  text: 'Test Text',
  isPrint: false,
};
