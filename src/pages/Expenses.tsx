import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import ExpenseDialog from '../components/ExpenseDialog.tsx'
import MonthSwitcher from '../components/MonthSwitcher.tsx'
import { iconFor } from '../lib/icons.tsx'
import { formatEuros } from '../lib/money.ts'
import { useAppStore } from '../store/useAppStore.ts'
import type { Expense } from '../types.ts'

export default function Expenses() {
  const month = useAppStore((state) => state.selectedMonth)
  const expenses = useAppStore((state) => state.expenses)
  const categories = useAppStore((state) => state.categories)
  const removeExpense = useAppStore((state) => state.removeExpense)
  const [editing, setEditing] = useState<Expense | null>(null)

  const monthExpenses = expenses
    .filter((expense) => expense.month === month)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <Stack spacing={2}>
      <MonthSwitcher />

      {monthExpenses.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          No hay gastos este mes. Usa el botón + para apuntar uno.
        </Typography>
      ) : (
        monthExpenses.map((expense) => {
          const category = categories.find((item) => item.id === expense.categoryId)
          const Icon = iconFor(category?.icon ?? 'other')
          return (
            <Card key={expense.id}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: category?.color ?? 'grey.500' }}>
                    <Icon />
                  </Avatar>
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800 }}>{formatEuros(expense.amount)}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {category?.name ?? 'Sin categoría'} · {expense.date.split('-').reverse().join('/')}
                      {expense.note ? ` · ${expense.note}` : ''}
                    </Typography>
                  </div>
                  <IconButton aria-label="Editar gasto" onClick={() => setEditing(expense)}>
                    <EditOutlinedIcon />
                  </IconButton>
                  <IconButton aria-label="Borrar gasto" onClick={() => removeExpense(expense.id)}>
                    <DeleteOutlinedIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          )
        })
      )}

      {editing ? <ExpenseDialog expense={editing} onClose={() => setEditing(null)} /> : null}
    </Stack>
  )
}
