import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState, type FormEvent } from 'react'
import { authErrorMessage, resetPassword, signIn, signUp } from '../lib/auth.ts'

type Mode = 'login' | 'register' | 'reset'

export default function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ severity: 'success' | 'error'; text: string } | null>(null)

  const changeMode = (next: Mode) => {
    setMode(next)
    setMessage(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (mode === 'register' && password !== confirmation) {
      setMessage({ severity: 'error', text: 'Las contraseñas no coinciden.' })
      return
    }
    setBusy(true)
    setMessage(null)
    try {
      // After a successful sign in or sign up the session changes and the app swaps this screen on its own
      if (mode === 'login') await signIn(email.trim(), password)
      else if (mode === 'register') await signUp(email.trim(), password)
      else {
        await resetPassword(email.trim())
        setMessage({ severity: 'success', text: 'Si el correo existe, te hemos enviado un enlace para cambiar la contraseña.' })
      }
    } catch (error) {
      setMessage({ severity: 'error', text: authErrorMessage(error) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', py: 4, pt: 'calc(32px + var(--safe-top))' }}>
      <Container maxWidth="xs">
        <Stack spacing={3}>
          <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Box component="img" src="/pwa-192x192.png" alt="Stash" sx={{ width: 120, height: 120, borderRadius: '22%' }} />
            <Typography color="text.secondary">Tu sueldo repartido en sobres</Typography>
          </Stack>

          <Card>
            <CardContent>
              <Stack component="form" spacing={2} onSubmit={handleSubmit}>
                {mode === 'reset' ? (
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Recuperar contraseña
                  </Typography>
                ) : (
                  <Tabs value={mode} onChange={(_, value: Mode) => changeMode(value)} variant="fullWidth">
                    <Tab label="Entrar" value="login" />
                    <Tab label="Crear cuenta" value="register" />
                  </Tabs>
                )}

                {message ? <Alert severity={message.severity}>{message.text}</Alert> : null}

                <TextField
                  label="Correo"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {mode === 'reset' ? null : (
                  <TextField
                    label="Contraseña"
                    type="password"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                )}
                {mode === 'register' ? (
                  <TextField
                    label="Repite la contraseña"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                  />
                ) : null}

                <Button type="submit" variant="contained" size="large" disabled={busy}>
                  {mode === 'login' ? 'Entrar' : mode === 'register' ? 'Crear cuenta' : 'Enviar enlace'}
                </Button>

                {mode === 'login' ? (
                  <Link component="button" type="button" variant="body2" onClick={() => changeMode('reset')}>
                    He olvidado mi contraseña
                  </Link>
                ) : null}
                {mode === 'reset' ? (
                  <Link component="button" type="button" variant="body2" onClick={() => changeMode('login')}>
                    Volver a entrar
                  </Link>
                ) : null}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}
