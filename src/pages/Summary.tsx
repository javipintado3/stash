import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router-dom'
import MonthSwitcher from '../components/MonthSwitcher.tsx'
import {
  budgetStatus,
  categoryAlerts,
  emptyPlan,
  fixedTotal,
  realSavings,
  remaining,
  spentInCategory,
  unassigned,
  yearSavings,
} from '../lib/budget.ts'
import { iconFor } from '../lib/icons.tsx'
import { formatEuros } from '../lib/money.ts'
import { useAppStore } from '../store/useAppStore.ts'

const STATUS_COLOR = { ok: 'success', warning: 'warning', over: 'error' } as const

export default function Summary() {
  const month = useAppStore((state) => state.selectedMonth)
  const storedPlan = useAppStore((state) => state.plans[month])
  const categories = useAppStore((state) => state.categories)
  const expenses = useAppStore((state) => state.expenses)
  const plans = useAppStore((state) => state.plans)
  const annualGoal = useAppStore((state) => state.annualSavingsGoal)

  const plan = storedPlan ?? emptyPlan(month)
  const free = unassigned(plan)
  const savings = realSavings(plan, expenses)
  const alerts = categoryAlerts(plan, expenses, categories)
  const year = month.slice(0, 4)
  const savedThisYear = yearSavings(plans, expenses, year)

  return (
    <Stack spacing={2}>
      <MonthSwitcher />

      {storedPlan === undefined ? (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography>Este mes todavía no está planificado.</Typography>
              <Button component={Link} to="/plan" variant="contained">
                Planificar mes
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="body2">Sueldo del mes</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {formatEuros(plan.income)}
              </Typography>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 2 }}>
                <div>
                  <Typography variant="caption">Aportaciones fijas</Typography>
                  <Typography sx={{ fontWeight: 600 }}>{formatEuros(fixedTotal(plan))}</Typography>
                </div>
                <div>
                  <Typography variant="caption">Te queda por repartir</Typography>
                  <Typography sx={{ fontWeight: 600, color: free < 0 ? 'error.dark' : 'inherit' }}>
                    {formatEuros(free)}
                  </Typography>
                </div>
              </Stack>
            </CardContent>
          </Card>

          {alerts.map((alert) => (
            <Alert key={alert.category.id} severity={alert.status === 'over' ? 'error' : 'warning'}>
              {alert.status === 'over'
                ? `${alert.category.name}: te has pasado ${formatEuros(alert.spent - alert.budget)} del presupuesto.`
                : `${alert.category.name}: llevas el ${alert.percent} % del presupuesto.`}
            </Alert>
          ))}

          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Ahorro real este mes
              </Typography>
              <Typography
                variant="h4"
                sx={{ fontWeight: 800 }}
                color={savings >= plan.savingsGoal ? 'success.main' : 'error.main'}
              >
                {formatEuros(savings)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Objetivo: {formatEuros(plan.savingsGoal)}
              </Typography>
            </CardContent>
          </Card>

          {annualGoal > 0 ? (
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Meta de ahorro de {year}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {formatEuros(Math.max(0, savedThisYear))} de {formatEuros(annualGoal)}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, Math.max(0, (savedThisYear / annualGoal) * 100))}
                  color={savedThisYear >= annualGoal ? 'success' : 'primary'}
                  sx={{ mt: 1.5, height: 8, borderRadius: 4 }}
                />
              </CardContent>
            </Card>
          ) : null}

          {categories.map((category) => {
            const budget = plan.budgets.find((item) => item.categoryId === category.id)?.amount ?? 0
            const spent = spentInCategory(expenses, month, category.id)
            const left = remaining(budget, spent)
            const status = budgetStatus(budget, spent)
            const Icon = iconFor(category.icon)
            return (
              <Card key={category.id}>
                <CardContent>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: category.color }}>
                      <Icon />
                    </Avatar>
                    <div style={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 800 }}>{category.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatEuros(spent)} de {formatEuros(budget)}
                      </Typography>
                    </div>
                    <Typography variant="h6" sx={{ fontWeight: 800 }} color={`${STATUS_COLOR[status]}.main`}>
                      {formatEuros(left)}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={budget > 0 ? Math.min(100, (spent / budget) * 100) : spent > 0 ? 100 : 0}
                    color={STATUS_COLOR[status]}
                    sx={{ mt: 1.5, height: 8, borderRadius: 4 }}
                  />
                </CardContent>
              </Card>
            )
          })}
        </>
      )}
    </Stack>
  )
}
