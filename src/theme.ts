import { createTheme } from '@mui/material/styles'

// Navy and mustard look: deep blue backgrounds, a mustard accent for the main action and thin borders instead of shadows
export const PRIMARY_COLOR = '#1f3a68'

const SERIF = '"Fraunces", Georgia, "Times New Roman", serif'

export function buildTheme(mode: 'light' | 'dark') {
  const dark = mode === 'dark'
  return createTheme({
    palette: {
      mode,
      primary: dark ? { main: '#8db3f0', contrastText: '#0d1624' } : { main: PRIMARY_COLOR, contrastText: '#ffffff' },
      secondary: { main: '#e8b33a', contrastText: '#1b1400' },
      success: { main: dark ? '#4cc38a' : '#2e9e5b' },
      warning: { main: '#f5a524' },
      error: { main: dark ? '#ff6b70' : '#e5484d' },
      background: dark ? { default: '#0d1624', paper: '#152238' } : { default: '#f3f5fa', paper: '#ffffff' },
      divider: dark ? '#273755' : '#dbe2ef',
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Manrope", system-ui, -apple-system, "Segoe UI", sans-serif',
      // Titles and big amounts use a serif so the numbers feel like a ledger
      h4: { fontFamily: SERIF },
      h5: { fontFamily: SERIF },
      h6: { fontFamily: SERIF },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: ({ theme }) => ({ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }) },
      },
      MuiButton: { styleOverrides: { root: { minHeight: 44 } } },
      MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
      MuiFab: { styleOverrides: { root: { borderRadius: 14, boxShadow: 'none' } } },
      MuiLinearProgress: { styleOverrides: { root: { height: 6, borderRadius: 3 } } },
    },
  })
}

export const lightTheme = buildTheme('light')
export const darkTheme = buildTheme('dark')
