import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import App from './App.tsx'
import { useAppStore } from './store/useAppStore.ts'
import { darkTheme, lightTheme } from './theme.ts'

// Picks the light or dark theme: the user's choice, or the phone's setting when it is "system"
export default function ThemedApp() {
  const themeMode = useAppStore((state) => state.themeMode)
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)')

  return (
    <ThemeProvider theme={themeMode === 'dark' || (themeMode === 'system' && systemDark) ? darkTheme : lightTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  )
}
