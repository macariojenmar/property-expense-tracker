'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getThemeOptions } from '@/theme';
import { useThemeStore } from '@/store/useThemeStore';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CurrencyProvider } from './CurrencyContext';

export const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const { mode, toggleMode } = useThemeStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: toggleMode,
    }),
    [toggleMode],
  );

  const theme = React.useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

  // Prevent hydration mismatch by only rendering after mount
  if (!mounted) {
    return null;
  }

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
