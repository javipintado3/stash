import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { useState } from 'react'
import { centsToInput, parseEurosToCents } from '../lib/money.ts'

type AmountInputProps = {
  label: string
  cents: number
  onChange: (cents: number) => void
  autoFocus?: boolean
}

// Keeps the raw text locally so inputs like "12," can be typed, and reports cents upwards
export default function AmountInput({ label, cents, onChange, autoFocus }: AmountInputProps) {
  const [text, setText] = useState(centsToInput(cents))

  return (
    <TextField
      label={label}
      value={text}
      onChange={(event) => {
        setText(event.target.value)
        onChange(parseEurosToCents(event.target.value))
      }}
      autoFocus={autoFocus}
      fullWidth
      slotProps={{
        htmlInput: { inputMode: 'decimal' },
        input: { endAdornment: <InputAdornment position="end">€</InputAdornment> },
      }}
    />
  )
}
