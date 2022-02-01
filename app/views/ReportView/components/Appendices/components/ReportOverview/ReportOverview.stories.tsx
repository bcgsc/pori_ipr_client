import React from 'react';
import { Story } from '@storybook/react/types-6-0';
import ReportOverview, { ReportOverviewProps } from '.';

export default {
  title: 'components/ReportOverview',
  component: ReportOverview,
};

const Template = (args) => <ReportOverview {...args} />;

export const CannotEdit: Story<ReportOverviewProps> = Template.bind({});
CannotEdit.args = {
  canEdit: false,
  isNew: false,
  templateId: '123456-uuid',
  text: 'Test Text',
  isPrint: false,
};
