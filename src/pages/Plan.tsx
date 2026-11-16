import AddIcon from '@mui/icons-material/Add'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import AmountInput from '../components/AmountInput.tsx'
import MonthSwitcher from '../components/MonthSwitcher.tsx'
import { emptyPlan, unassigned } from '../lib/budget.ts'
import { iconFor } from '../lib/icons.tsx'
import { formatEuros } from '../lib/money.ts'
import { useAppStore } from '../store/useAppStore.ts'

export default function Plan() {
  const month = useAppStore((state) => state.selectedMonth)
  const storedPlan = useAppStore((state) => state.plans[month])
  const categories = useAppStore((state) => state.categories)
  const updatePlan = useAppStore((state) => state.updatePlan)
  const copyPreviousMonth = useAppStore((state) => state.copyPreviousMonth)

  const plan = storedPlan ?? emptyPlan(month)
  const free = unassigned(plan)

  return (
    <Stack spacing={2}>
      <MonthSwitcher />

      <Card
        sx={{
          position: 'sticky',
          top: 'calc(var(--safe-top) + 8px)',
          zIndex: 5,
          bgcolor: free < 0 ? 'error.main' : free === 0 ? 'success.main' : 'primary.main',
          color: free === 0 || free < 0 ? 'common.white' : 'primary.contrastText',
        }}
      >
        <CardContent>
          <Typography variant="body2">Sin asignar</Typography>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {formatEuros(free)}
          </Typography>
        </CardContent>
      </Card>

      {storedPlan === undefined ? (
        <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={() => copyPreviousMonth(month)}>
          Copiar plantilla del mes anterior
        </Button>
      ) : null}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Ingresos y ahorro
            </Typography>
            <AmountInput
              key={`${month}-income`}
              label="Sueldo del mes"
              cents={plan.income}
              onChange={(cents) => updatePlan(month, (current) => ({ ...current, income: cents }))}
            />
            <AmountInput
              key={`${month}-savings`}
              label="Ahorro objetivo"
              cents={plan.savingsGoal}
              onChange={(cents) => updatePlan(month, (current) => ({ ...current, savingsGoal: cents }))}
            />
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Aportaciones fijas
            </Typography>
            {plan.fixedItems.map((item) => (
              <Stack key={`${month}-${item.id}`} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <TextField
                  label="Nombre"
                  value={item.name}
                  onChange={(event) =>
                    updatePlan(month, (current) => ({
                      ...current,
                      fixedItems: current.fixedItems.map((fixed) =>
                        fixed.id === item.id ? { ...fixed, name: event.target.value } : fixed,
                      ),
                    }))
                  }
                  fullWidth
                />
                <AmountInput
                  label="Importe"
                  cents={item.amount}
                  onChange={(cents) =>
                    updatePlan(month, (current) => ({
                      ...current,
                      fixedItems: current.fixedItems.map((fixed) =>
                        fixed.id === item.id ? { ...fixed, amount: cents } : fixed,
                      ),
                    }))
                  }
                />
                <IconButton
                  aria-label={`Quitar ${item.name}`}
                  onClick={() =>
                    updatePlan(month, (current) => ({
                      ...current,
                      fixedItems: current.fixedItems.filter((fixed) => fixed.id !== item.id),
                    }))
                  }
                >
                  <DeleteOutlinedIcon />
                </IconButton>
              </Stack>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() =>
                updatePlan(month, (current) => ({
                  ...current,
                  fixedItems: [...current.fixedItems, { id: crypto.randomUUID(), name: '', amount: 0 }],
                }))
              }
            >
              Añadir aportación (ej. Padres)
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Categorías
            </Typography>
            {categories.map((category) => {
              const Icon = iconFor(category.icon)
              return (
                <Stack key={`${month}-${category.id}`} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: category.color }}>
                    <Icon />
                  </Avatar>
                  <AmountInput
                    label={category.name}
                    cents={plan.budgets.find((budget) => budget.categoryId === category.id)?.amount ?? 0}
                    onChange={(cents) =>
                      updatePlan(month, (current) => ({
                        ...current,
                        budgets: [
                          ...current.budgets.filter((budget) => budget.categoryId !== category.id),
                          { categoryId: category.id, amount: cents },
                        ],
                      }))
                    }
                  />
                </Stack>
              )
            })}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
