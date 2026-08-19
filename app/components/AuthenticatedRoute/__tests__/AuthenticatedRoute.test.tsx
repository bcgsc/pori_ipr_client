import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Switch, Route } from 'react-router-dom';

import useSecurity from '@/hooks/useSecurity';
import useResource from '@/hooks/useResource';
import { isAuthorized } from '@/services/management/auth';
import AuthenticatedRoute from '..';

jest.mock('@/hooks/useSecurity');
jest.mock('@/hooks/useResource');
jest.mock('@/services/management/auth');

const TestComponent = () => <div>Protected Content</div>;

const renderRoute = (routeProps: Record<string, unknown> = {}) => render(
  <MemoryRouter initialEntries={['/protected']}>
    <Switch>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <AuthenticatedRoute path="/protected" component={TestComponent} {...routeProps} />
      <Route path="/login"><div>Login Page</div></Route>
      <Route exact path="/"><div>Home Page</div></Route>
    </Switch>
  </MemoryRouter>,
);

describe('AuthenticatedRoute', () => {
  beforeEach(() => {
    (useSecurity as jest.Mock).mockReturnValue({ authorizationToken: 'token' });
    (useResource as jest.Mock).mockReturnValue({});
  });

  test('renders the component when authorized', () => {
    (isAuthorized as jest.Mock).mockReturnValue(true);

    renderRoute();

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  test('redirects to login when not authorized', () => {
    (isAuthorized as jest.Mock).mockReturnValue(false);

    renderRoute();

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  test('redirects home when the required access is missing', () => {
    (isAuthorized as jest.Mock).mockReturnValue(true);
    (useResource as jest.Mock).mockReturnValue({ adminAccess: false });

    renderRoute({ requiredAccess: 'adminAccess' });

    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).toBeNull();
  });
});
