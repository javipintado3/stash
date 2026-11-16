import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import { useState, type Ref } from 'react'
import { centsToInput, parseEurosToCents } from '../lib/money.ts'

type AmountInputProps = {
  label: string
  cents: number
  onChange: (cents: number) => void
  inputRef?: Ref<HTMLInputElement>
}

// Keeps the raw text locally so inputs like "12," can be typed, and reports cents upwards
export default function AmountInput({ label, cents, onChange, inputRef }: AmountInputProps) {
  const [text, setText] = useState(centsToInput(cents))

  return (
    <TextField
      label={label}
      value={text}
      onChange={(event) => {
        setText(event.target.value)
        onChange(parseEurosToCents(event.target.value))
      }}
      inputRef={inputRef}
      fullWidth
      slotProps={{
        htmlInput: { inputMode: 'decimal' },
        input: { endAdornment: <InputAdornment position="end">€</InputAdornment> },
      }}
    />
  )
}
