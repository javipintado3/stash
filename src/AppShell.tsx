import AddIcon from '@mui/icons-material/Add'
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Fab from '@mui/material/Fab'
import IconButton from '@mui/material/IconButton'
import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import BottomNav from './components/BottomNav.tsx'
import ExpenseDialog from './components/ExpenseDialog.tsx'
import HelpDialog from './components/HelpDialog.tsx'
import Expenses from './pages/Expenses.tsx'
import Plan from './pages/Plan.tsx'
import Settings from './pages/Settings.tsx'
import Stats from './pages/Stats.tsx'
import Summary from './pages/Summary.tsx'

export default function AppShell() {
  const [adding, setAdding] = useState(false)
  const [helping, setHelping] = useState(false)

  return (
    <Box sx={{ minHeight: '100dvh', pt: 'var(--safe-top)' }}>
      <Container maxWidth="sm" sx={{ py: 2, pb: 'calc(96px + var(--safe-bottom))', position: 'relative' }}>
        <IconButton
          aria-label="Cómo funciona"
          onClick={() => setHelping(true)}
          sx={{ position: 'absolute', top: 12, right: 8, zIndex: 1 }}
        >
          <HelpOutlineIcon />
        </IconButton>
        <Routes>
          <Route path="/" element={<Summary />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Container>
      <Fab
        color="primary"
        aria-label="Añadir gasto"
        onClick={() => setAdding(true)}
        sx={{ position: 'fixed', right: 16, bottom: 'calc(72px + var(--safe-bottom))', zIndex: 11 }}
      >
        <AddIcon />
      </Fab>
      <BottomNav />
      {adding ? <ExpenseDialog onClose={() => setAdding(false)} /> : null}
      {helping ? <HelpDialog onClose={() => setHelping(false)} /> : null}
    </Box>
  )
}
