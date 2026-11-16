import { createTheme } from '@mui/material/styles'

export const PRIMARY_COLOR = '#00AEEF'

export const theme = createTheme({
  palette: {
    primary: { main: PRIMARY_COLOR, contrastText: '#062a40' },
    success: { main: '#2e9e5b' },
    warning: { main: '#f5a524' },
    error: { main: '#e5484d' },
    background: { default: '#f2f9fd', paper: '#ffffff' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { boxShadow: '0 2px 12px rgba(0, 120, 180, 0.08)' } },
    },
    MuiButton: { styleOverrides: { root: { minHeight: 44 } } },
    MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44 } } },
  },
})
