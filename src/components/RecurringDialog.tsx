import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useRef, useState } from 'react'
import { useAppStore } from '../store/useAppStore.ts'
import type { RecurringExpense } from '../types.ts'
import AmountInput from './AmountInput.tsx'

type RecurringDialogProps = {
  item?: RecurringExpense
  onClose: () => void
}

// Days go up to 28 so the expense exists in every month
const DAYS = Array.from({ length: 28 }, (_, index) => index + 1)

// Render this component only while open, so its form state starts fresh each time
export default function RecurringDialog({ item, onClose }: RecurringDialogProps) {
  const categories = useAppStore((state) => state.categories)
  const saveRecurring = useAppStore((state) => state.saveRecurring)
  const nameRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(item?.name ?? '')
  const [amount, setAmount] = useState(item?.amount ?? 0)
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? categories[0]?.id ?? '')
  const [day, setDay] = useState(item?.day ?? 1)

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ transition: { onEntered: () => nameRef.current?.focus() } }}
    >
      <DialogTitle>{item ? 'Editar gasto recurrente' : 'Nuevo gasto recurrente'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Nombre" value={name} onChange={(event) => setName(event.target.value)} fullWidth inputRef={nameRef} />
          <AmountInput label="Importe" cents={amount} onChange={setAmount} />
          <TextField select label="Categoría" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} fullWidth>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Día del mes" value={day} onChange={(event) => setDay(Number(event.target.value))} fullWidth>
            {DAYS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={name.trim() === '' || amount <= 0 || categoryId === ''}
          onClick={() => {
            saveRecurring({
              id: item?.id ?? crypto.randomUUID(),
              name: name.trim(),
              categoryId,
              amount,
              day,
              lastGenerated: item?.lastGenerated,
            })
            onClose()
          }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
