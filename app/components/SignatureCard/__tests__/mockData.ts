const mockNullData = {
  ident: 'mockIdent',
  createdAt: '2020',
  updatedAt: '2020',
  authorSignature: null,
  authorSignedAt: null,
  reviewerSignature: null,
  reviewerSignedAt: null,
};

const mockNullObjectData = {
  ident: 'mockIdent',
  createdAt: '2020',
  updatedAt: '2020',
  authorSignature: null,
  authorSignedAt: null,
  reviewerSignature: {
    ident: null,
    createdAt: null,
    updatedAt: null,
    email: null,
    firstName: null,
    lastName: null,
    lastLogin: null,
    type: null,
    username: null,
  },
  reviewerSignedAt: null,
};

const mockObjectData = {
  ident: 'mockIdent',
  createdAt: '2020',
  updatedAt: '2020',
  authorSignature: null,
  authorSignedAt: null,
  reviewerSignature: {
    ident: '0000-1111',
    createdAt: '2020',
    updatedAt: '2020',
    email: 'aaa@bcgsc.ca',
    firstName: 'eeee',
    lastName: 'ooooo',
    lastLogin: null,
    type: 'bcgsc',
    username: 'eooooo',
  },
  reviewerSignedAt: '2020',
};

export {
  mockNullData,
  mockNullObjectData,
  mockObjectData,
};
