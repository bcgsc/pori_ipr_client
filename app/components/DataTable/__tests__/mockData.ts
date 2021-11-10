const mockRowData = [{
  username: 'pattredes',
  password: 'hunter2',
  email: 'usul@arrakis.dune',
}, {
  username: 'mmartin',
  password: 'password123',
  email: 'matewmartin@victokia.com',
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
