import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import useSecurity from '@/hooks/useSecurity';
import SidebarContext from '@/context/SidebarContext';
import { logout } from '@/services/management/auth';
import NavBar from '..';

jest.mock('@/hooks/useSecurity');
jest.mock('@/services/management/auth');
// The dialog children carry their own data dependencies; they are closed in these tests
jest.mock('../components/FeedbackDialog', () => () => null);
jest.mock('../components/UserSettingsDialog', () => () => null);

// VERSION is injected at build time via webpack; provide it for the test runtime
(global as unknown as { VERSION: string }).VERSION = '9.9.9';

const renderNavBar = (sidebarValue = { sidebarMaximized: false, setSidebarMaximized: jest.fn() }) => {
  (useSecurity as jest.Mock).mockReturnValue({
    userDetails: { firstName: 'Jane', lastName: 'Doe' },
  });
  return render(
    <SidebarContext.Provider value={sidebarValue as React.ContextType<typeof SidebarContext>}>
      <NavBar />
    </SidebarContext.Provider>,
  );
};

describe('NavBar', () => {
  test('renders the title, version and the current user name', () => {
    renderNavBar();

    expect(screen.getByText('Integrated Pipeline Reports')).toBeInTheDocument();
    expect(screen.getByText('v9.9.9')).toBeInTheDocument();
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
  });

  test('opens the user menu with profile, feedback and logout', () => {
    renderNavBar();

    fireEvent.click(screen.getByText(/Jane Doe/));

    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  test('logs out when the logout item is clicked', () => {
    renderNavBar();

    fireEvent.click(screen.getByText(/Jane Doe/));
    fireEvent.click(screen.getByText('Logout'));

    expect(logout).toHaveBeenCalled();
  });

  test('toggles the sidebar when the menu icon is clicked', () => {
    const setSidebarMaximized = jest.fn();
    renderNavBar({ sidebarMaximized: false, setSidebarMaximized });

    fireEvent.click(screen.getByTestId('MenuIcon').closest('button'));

    expect(setSidebarMaximized).toHaveBeenCalledWith(true);
  });
});
