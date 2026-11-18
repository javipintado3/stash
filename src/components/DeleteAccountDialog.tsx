import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { authErrorMessage, deleteAccount } from '../lib/auth.ts'
import PasswordField from './PasswordField.tsx'

type DeleteAccountDialogProps = {
  onClose: () => void
}

export default function DeleteAccountDialog({ onClose }: DeleteAccountDialogProps) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setBusy(true)
    setError('')
    try {
      // When the account is gone the session closes and the app goes back to the login on its own
      await deleteAccount(password)
    } catch (caught) {
      setError(authErrorMessage(caught))
      setBusy(false)
    }
  }

  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Borrar mi cuenta</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2">
            Se borrarán tu cuenta y todos tus datos: planes, gastos, categorías y gastos recurrentes. No se puede
            deshacer. Si quieres conservarlos, exporta antes una copia de seguridad.
          </Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <PasswordField label="Escribe tu contraseña" autoComplete="current-password" value={password} onChange={setPassword} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose}>
          Cancelar
        </Button>
        <Button color="error" variant="contained" disabled={busy || password === ''} onClick={handleDelete}>
          Borrar para siempre
        </Button>
      </DialogActions>
    </Dialog>
  )
}
