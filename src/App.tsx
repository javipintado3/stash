import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import AppShell from './AppShell.tsx'
import { useAuth } from './lib/auth.ts'
import { isFirebaseConfigured } from './lib/firebase.ts'
import Login from './pages/Login.tsx'
import { useAppStore } from './store/useAppStore.ts'

function Loading() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <CircularProgress aria-label="Cargando" />
    </Box>
  )
}

// Decides what to show: setup message, loading, login or the app itself
export default function App() {
  const auth = useAuth()
  const loaded = useAppStore((state) => state.loaded)

  return !isFirebaseConfigured ? (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Alert severity="warning">
        Falta la configuración de Firebase. Copia .env.example a .env.local y rellena los valores de tu proyecto.
      </Alert>
    </Container>
  ) : auth.status === 'loading' ? (
    <Loading />
  ) : auth.user === null ? (
    <Login />
  ) : loaded ? (
    <AppShell />
  ) : (
    <Loading />
  )
}
