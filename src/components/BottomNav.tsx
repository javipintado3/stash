import BarChartIcon from '@mui/icons-material/BarChart'
import ListAltIcon from '@mui/icons-material/ListAlt'
import PaymentsIcon from '@mui/icons-material/Payments'
import SettingsIcon from '@mui/icons-material/Settings'
import TuneIcon from '@mui/icons-material/Tune'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Paper from '@mui/material/Paper'
import { useLocation, useNavigate } from 'react-router-dom'

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <Paper
      elevation={8}
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10, pb: 'var(--safe-bottom)' }}
    >
      <BottomNavigation
        value={pathname}
        onChange={(_, value: string) => navigate(value)}
        showLabels
        sx={{ '& .MuiBottomNavigationAction-root': { minWidth: 0, px: 0.5 } }}
      >
        <BottomNavigationAction label="Resumen" value="/" icon={<PaymentsIcon />} />
        <BottomNavigationAction label="Planificar" value="/plan" icon={<TuneIcon />} />
        <BottomNavigationAction label="Gastos" value="/expenses" icon={<ListAltIcon />} />
        <BottomNavigationAction label="Gráficas" value="/stats" icon={<BarChartIcon />} />
        <BottomNavigationAction label="Ajustes" value="/settings" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Paper>
  )
}
