import { createTheme } from '@mui/material/styles'

export const PRIMARY_COLOR = '#00AEEF'

export function buildTheme(mode: 'light' | 'dark') {
  const dark = mode === 'dark'
  return createTheme({
    palette: {
      mode,
      primary: { main: PRIMARY_COLOR, contrastText: '#062a40' },
      success: { main: dark ? '#4cc38a' : '#2e9e5b' },
      warning: { main: '#f5a524' },
      error: { main: dark ? '#ff6b70' : '#e5484d' },
      background: dark ? { default: '#0b1a24', paper: '#13262f' } : { default: '#f2f9fd', paper: '#ffffff' },
    },
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: '"Manrope", system-ui, -apple-system, "Segoe UI", sans-serif',
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { boxShadow: dark ? 'none' : '0 2px 12px rgba(0, 120, 180, 0.08)' } },
      },
      MuiButton: { styleOverrides: { root: { minHeight: 44 } } },
      MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
    },
  })
}

export const lightTheme = buildTheme('light')
export const darkTheme = buildTheme('dark')
