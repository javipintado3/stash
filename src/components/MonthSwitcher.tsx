import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { monthLabel, shiftMonth } from '../lib/months.ts'
import { useAppStore } from '../store/useAppStore.ts'

export default function MonthSwitcher() {
  const month = useAppStore((state) => state.selectedMonth)
  const setSelectedMonth = useAppStore((state) => state.setSelectedMonth)

  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <IconButton aria-label="Mes anterior" onClick={() => setSelectedMonth(shiftMonth(month, -1))}>
        <ChevronLeftIcon />
      </IconButton>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        {monthLabel(month)}
      </Typography>
      <IconButton aria-label="Mes siguiente" onClick={() => setSelectedMonth(shiftMonth(month, 1))}>
        <ChevronRightIcon />
      </IconButton>
    </Stack>
  )
}
