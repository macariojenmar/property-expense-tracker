'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getThemeOptions } from '@/theme';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CurrencyProvider } from './CurrencyContext';

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<'light' | 'dark'>('light');

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = React.useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <AppRouterCacheProvider>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CurrencyProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
          </CurrencyProvider>
        </LocalizationProvider>
      </AppRouterCacheProvider>
    </ColorModeContext.Provider>
  );
}
