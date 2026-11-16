import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav.tsx'
import Expenses from './pages/Expenses.tsx'
import Plan from './pages/Plan.tsx'
import Settings from './pages/Settings.tsx'
import Summary from './pages/Summary.tsx'

export default function App() {
  return (
    <Box sx={{ minHeight: '100dvh', pt: 'var(--safe-top)' }}>
      <Container maxWidth="sm" sx={{ py: 2, pb: 'calc(96px + var(--safe-bottom))' }}>
        <Routes>
          <Route path="/" element={<Summary />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Container>
      <BottomNav />
    </Box>
  )
}
