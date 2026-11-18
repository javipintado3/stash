import { createTheme } from '@mui/material/styles'

// Warm paper look: cream and graphite backgrounds, a sage green accent and thin borders instead of shadows
export const PRIMARY_COLOR = '#3f6b4f'

const SERIF = '"Fraunces", Georgia, "Times New Roman", serif'

export function buildTheme(mode: 'light' | 'dark') {
  const dark = mode === 'dark'
  return createTheme({
    palette: {
      mode,
      primary: dark ? { main: '#9fcaa8', contrastText: '#14241a' } : { main: PRIMARY_COLOR, contrastText: '#ffffff' },
      success: { main: dark ? '#7fc99a' : '#2e7d4f' },
      warning: { main: dark ? '#e0b04a' : '#b9801a' },
      error: { main: dark ? '#e88a82' : '#b94a40' },
      background: dark ? { default: '#171613', paper: '#22211d' } : { default: '#f5efe3', paper: '#fffcf5' },
      divider: dark ? '#37352f' : '#e2d9c6',
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
