import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { BarChart } from '@mui/x-charts/BarChart'
import { PieChart } from '@mui/x-charts/PieChart'
import MonthSwitcher from '../components/MonthSwitcher.tsx'
import { monthlySavings, spentInCategory } from '../lib/budget.ts'
import { formatEuros } from '../lib/money.ts'
import { shiftMonth } from '../lib/months.ts'
import { useAppStore } from '../store/useAppStore.ts'

const MONTHS_SHOWN = 6

const SHORT_MONTH = new Intl.DateTimeFormat('es-ES', { month: 'short' })

function shortMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number)
  return SHORT_MONTH.format(new Date(year, monthNumber - 1, 1))
}

// Chart values are in euros, the amounts of the app are in cents
const eurosLabel = (value: number | null) => (value === null ? '' : formatEuros(Math.round(value * 100)))

export default function Stats() {
  const month = useAppStore((state) => state.selectedMonth)
  const plans = useAppStore((state) => state.plans)
  const expenses = useAppStore((state) => state.expenses)
  const categories = useAppStore((state) => state.categories)

  const months = Array.from({ length: MONTHS_SHOWN }, (_, index) => shiftMonth(month, index - (MONTHS_SHOWN - 1)))
  const savings = monthlySavings(plans, expenses, months)
  const byCategory = categories
    .map((category) => ({ category, spent: spentInCategory(expenses, month, category.id) }))
    .filter((item) => item.spent > 0)

  return (
    <Stack spacing={2}>
      <MonthSwitcher />

      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Ahorro de los últimos {MONTHS_SHOWN} meses
          </Typography>
          <BarChart
            height={260}
            xAxis={[{ scaleType: 'band', data: months.map(shortMonthLabel) }]}
            series={[
              { data: savings.map((item) => item.savings / 100), label: 'Ahorro real', color: '#6f9f7c', valueFormatter: eurosLabel },
              { data: savings.map((item) => item.goal / 100), label: 'Objetivo', color: '#9aa7b0', valueFormatter: eurosLabel },
            ]}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Gasto por categoría
          </Typography>
          {byCategory.length > 0 ? (
            <PieChart
              height={260}
              series={[
                {
                  innerRadius: 50,
                  paddingAngle: 2,
                  cornerRadius: 4,
                  valueFormatter: (item) => eurosLabel(item.value),
                  data: byCategory.map((item) => ({
                    id: item.category.id,
                    label: item.category.name,
                    value: item.spent / 100,
                    color: item.category.color,
                  })),
                },
              ]}
            />
          ) : (
            <Typography color="text.secondary" sx={{ py: 3 }}>
              Este mes todavía no hay gastos.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  )
}
