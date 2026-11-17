import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useRef, useState } from 'react'
import { iconFor } from '../lib/icons.tsx'
import { todayIso } from '../lib/months.ts'
import { useAppStore } from '../store/useAppStore.ts'
import type { Expense } from '../types.ts'
import AmountInput from './AmountInput.tsx'

type ExpenseDialogProps = {
  expense?: Expense
  onClose: () => void
}

// Render this component only while open, so its form state starts fresh each time
export default function ExpenseDialog({ expense, onClose }: ExpenseDialogProps) {
  const categories = useAppStore((state) => state.categories)
  const lastCategoryId = useAppStore((state) => state.lastCategoryId)
  const addExpense = useAppStore((state) => state.addExpense)
  const updateExpense = useAppStore((state) => state.updateExpense)

  const amountRef = useRef<HTMLInputElement>(null)
  const [categoryId, setCategoryId] = useState(
    expense?.categoryId ??
      (categories.some((category) => category.id === lastCategoryId) ? lastCategoryId : categories[0]?.id) ??
      '',
  )
  const [amount, setAmount] = useState(expense?.amount ?? 0)
  const [note, setNote] = useState(expense?.note ?? '')
  const [date, setDate] = useState(expense?.date ?? todayIso())

  const canSave = amount > 0 && categoryId !== '' && date !== ''

  const handleSave = () => {
    const saved: Expense = {
      id: expense?.id ?? crypto.randomUUID(),
      month: date.slice(0, 7),
      categoryId,
      amount,
      note: note.trim() === '' ? undefined : note.trim(),
      date,
    }
    return expense ? updateExpense(saved) : addExpense(saved)
  }

  // Enter saves, so a typical expense is: amount, tap a category, Enter
  const saveAndClose = () => {
    handleSave()
    onClose()
  }

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ transition: { onEntered: () => amountRef.current?.focus() } }}
    >
      <DialogTitle>{expense ? 'Editar gasto' : 'Nuevo gasto'}</DialogTitle>
      <DialogContent>
        <Stack
          spacing={2}
          sx={{ pt: 1 }}
          onKeyDown={(event) => (event.key === 'Enter' && canSave ? saveAndClose() : undefined)}
        >
          <AmountInput label="Importe" cents={amount} onChange={setAmount} inputRef={amountRef} />
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {categories.map((category) => {
              const Icon = iconFor(category.icon)
              return (
                <Chip
                  key={category.id}
                  label={category.name}
                  icon={<Icon />}
                  onClick={() => setCategoryId(category.id)}
                  color={categoryId === category.id ? 'primary' : 'default'}
                  variant={categoryId === category.id ? 'filled' : 'outlined'}
                  sx={{ height: 44, fontSize: 15 }}
                />
              )
            })}
          </Stack>
          <TextField label="Nota (opcional)" value={note} onChange={(event) => setNote(event.target.value)} fullWidth />
          <TextField
            label="Fecha"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={!canSave}
          onClick={saveAndClose}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
