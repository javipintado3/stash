import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { useState } from 'react'

type PasswordFieldProps = {
  label: string
  value: string
  autoComplete: 'current-password' | 'new-password'
  onChange: (value: string) => void
}

// Password input with an eye button to show or hide what is typed
export default function PasswordField({ label, value, autoComplete, onChange }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      label={label}
      type={visible ? 'text' : 'password'}
      autoComplete={autoComplete}
      required
      value={value}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setVisible(!visible)}
                onMouseDown={(event) => event.preventDefault()}
              >
                {visible ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  )
}
