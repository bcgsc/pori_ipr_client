import React from 'react';
import { screen, render } from '@testing-library/react';
import { StaticRouter } from 'react-router-dom';
import mediaQuery from 'css-mediaquery';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Sidebar from '..';
import ResourceContext from '../../../context/ResourceContext';

const context = {};
const permissions = {
  germlineAccess: true,
  reportsAccess: true,
  adminAccess: true,
  reportSettingAccess: true,
  managerAccess: false,
  reportEditAccess: false,
  unreviewedAccess: false,
  nonproductionAccess: false,
  allStates: [],
  unreviewedStates: [],
  nonproductionStates: [],
};

const theme = createTheme();

// https://mui.com/components/use-media-query/#testing
function createMatchMedia(width: number) {
  return (query: string): MediaQueryList => ({
    matches: mediaQuery.match(query, {
      width,
    }),
    addListener: () => {},
    removeListener: () => {},
    media: '',
    onchange: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  });
}

beforeAll(() => {
  window.matchMedia = createMatchMedia(1000);
});

test('includes basename in links when provided', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ResourceContext.Provider value={permissions}>
        <StaticRouter location="/ipr" context={context} basename="/ipr">
          <Sidebar />
        </StaticRouter>
      </ResourceContext.Provider>
    </ThemeProvider>,
  );

  let link = (await screen.findByText('All Reports')).closest('a');
  expect(link.href).toEqual(`${window.location.origin}/ipr/reports`);

  link = (await screen.findByText('My Reports')).closest('a');
  expect(link.href).toEqual(`${window.location.origin}/ipr/my-reports`);

  link = (await screen.findByText('Germline')).closest('a');
  expect(link.href).toEqual(`${window.location.origin}/ipr/germline`);

  link = (await screen.findByText('Users')).closest('a');
  expect(link.href).toEqual(`${window.location.origin}/ipr/admin/users`);
});

test('has valid links when no basename provided', async () => {
  render(
    <ThemeProvider theme={theme}>
      <ResourceContext.Provider value={permissions}>
        <StaticRouter location="/" context={context} basename="">
          <Sidebar />
        </StaticRouter>
      </ResourceContext.Provider>
    </ThemeProvider>,
  );

  let link = (await screen.findByText('All Reports')).closest('a');
  expect(link.href).toEqual(`${window.location.origin}/reports`);

  link = (await screen.findByText('My Reports')).closest('a');
  expect(link.href).toEqual(`${window.location.origin}/my-reports`);

  link = (await screen.findByText('Germline')).closest('a');
  expect(link.href).toEqual(`${window.location.origin}/germline`);

  link = (await screen.findByText('Users')).closest('a');
  expect(link.href).toEqual(`${window.location.origin}/admin/users`);
});
