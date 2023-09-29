const mockRowData = [{
  username: 'pattredes',
  password: 'hunter2',
  email: 'usul@arrakis.dune',
  ident: 'uuid1',
}, {
  username: 'mmartin',
  password: 'password123',
  email: 'matewmartin@victokia.com',
  ident: 'uuid2',
}];

const mockColumnDefs = [{
  headerName: 'Username',
  field: 'username',
  hide: false,
}, {
  headerName: 'Password',
  field: 'password',
  hide: false,
}, {
  headerName: 'Email',
  field: 'email',
  hide: false,
}, {
  headerName: 'ident',
  field: 'ident',
  hide: false,
}];

const mockTitleText = 'This is a table with a title';

const mockFilterText = 'password123';

const mockVisibleColumns = ['password', 'email'];

const mockDemoDescription = 'This is a test demo description';

export {
  mockRowData,
  mockColumnDefs,
  mockTitleText,
  mockFilterText,
  mockVisibleColumns,
  mockDemoDescription,
};
