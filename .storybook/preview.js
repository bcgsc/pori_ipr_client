import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { addDecorator } from "@storybook/react";
import { withThemes } from "@react-theming/storybook-addon";
import theme from '../app/appTheme';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

const providerFn = ({ theme, children }) => {
  const serialTheme = JSON.parse(JSON.stringify(theme));
  const muiTheme = createTheme(serialTheme);
  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
};

addDecorator(withThemes(null, [theme], { providerFn }));
