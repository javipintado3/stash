import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import { useState } from 'react'
import { authErrorMessage, changePassword } from '../lib/auth.ts'
import PasswordField from './PasswordField.tsx'

type ChangePasswordDialogProps = {
  onChanged: () => void
  onClose: () => void
}

export default function ChangePasswordDialog({ onChanged, onClose }: ChangePasswordDialogProps) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (next !== confirmation) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await changePassword(current, next)
      onChanged()
      onClose()
    } catch (caught) {
      setError(authErrorMessage(caught))
      setBusy(false)
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Cambiar contraseña</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <PasswordField label="Contraseña actual" autoComplete="current-password" value={current} onChange={setCurrent} />
          <PasswordField label="Contraseña nueva" autoComplete="new-password" value={next} onChange={setNext} />
          <PasswordField
            label="Repite la contraseña nueva"
            autoComplete="new-password"
            value={confirmation}
            onChange={setConfirmation}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={busy || current === '' || next === '' || confirmation === ''} onClick={handleSave}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
