import React from 'react';
import { screen, render } from '@testing-library/react';
import { StaticRouter } from 'react-router-dom';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Sidebar from '..';
import ResourceContext from '../../../context/ResourceContext';

const context = {};
const permissions = {
  germlineAccess: true,
  reportAccess: true,
  adminAccess: true,
};

// otherwise nothing will render due to the `Hidden` component
// https://github.com/enzymejs/enzyme/issues/2179#issuecomment-529320192
const theme = createMuiTheme({ props: { MuiWithWidth: { initialWidth: 'md' } } });

test('includes basename in links when provided', async () => {
  render(
    <MuiThemeProvider theme={theme}>
      <ResourceContext.Provider value={permissions}>
        <StaticRouter location="/ipr" context={context} basename="/ipr">
          <Sidebar />
        </StaticRouter>
      </ResourceContext.Provider>
    </MuiThemeProvider>,
  );

  let link = (await screen.findByText('Reports')).closest('a');
  expect(link.href).toEqual(`${window.location.origin}/ipr/reports`);

  link = (await screen.findByText('Germline')).closest('a');
  expect(link.href).toEqual(`${window.location.origin}/ipr/germline`);

  link = (await screen.findByText('Users')).closest('a');
  expect(link.href).toEqual(`${window.location.origin}/ipr/admin/users`);
});

test('has valid links when no basename provided', async () => {
  render(
    <MuiThemeProvider theme={theme}>
      <ResourceContext.Provider value={permissions}>
        <StaticRouter location="/" context={context} basename="">
          <Sidebar />
        </StaticRouter>
      </ResourceContext.Provider>
    </MuiThemeProvider>,
  );

  let link = (await screen.findByText('Reports')).closest('a');
  expect(link.href).toEqual(`${window.location.origin}/reports`);

  link = (await screen.findByText('Germline')).closest('a');
  expect(link.href).toEqual(`${window.location.origin}/germline`);

  link = (await screen.findByText('Users')).closest('a');
  expect(link.href).toEqual(`${window.location.origin}/admin/users`);
});
