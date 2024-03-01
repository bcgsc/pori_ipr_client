import React, { useMemo } from 'react';
import { action } from '@storybook/addon-actions';
import { StoryFn } from '@storybook/react';

import ReportContext from '@/context/ReportContext';
import SignatureCard, { SignatureCardProps } from '.';

export default {
  title: 'components/SignatureCard',
  component: SignatureCard,
};

const Template = (args) => {
  const value = useMemo(() => ({
    canEdit: true,
    report: null,
    setReport: () => { },
  }), []);

  return (
    <ReportContext.Provider value={value}>
      <SignatureCard {...args} />
    </ReportContext.Provider>
  );
};

export const Unsigned: StoryFn<SignatureCardProps> = Template.bind({});

Unsigned.args = {
  title: 'Author',
  signatures: null,
  type: 'author',
  isPrint: false,
  onClick: action('onClick'),
};

const signedAt = '2021-12-02T22:05:15.326Z';

export const Signed: StoryFn<SignatureCardProps> = Template.bind({});

Signed.args = {
  title: 'Author',
  signatures: {
    authorSignature: {
      createdAt: '2018-09-12T10:24:57.318Z',
      deletedAt: null,
      email: 'augustus@mccrae.net',
      firstName: 'Augustus',
      ident: '250579a-eefa-cbb7-bfc8-4219b00a990b',
      lastLogin: null,
      lastName: 'McCrae',
      type: 'bcgsc',
      updatedAt: null,
      username: 'amccrae',
    },
    authorSignedAt: signedAt,
    createdAt: null,
    ident: '2e05b9a-eef2-cfb7-b0c0-4919a02a570a',
    reviewerSignature: null,
    reviewerSignedAt: null,
    updatedAt: signedAt,
    creatorSignature: null,
    creatorSignedAt: signedAt,
  },
  type: 'author',
  isPrint: false,
  onClick: action('onClick'),
};
