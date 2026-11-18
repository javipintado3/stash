import AddIcon from '@mui/icons-material/Add'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import AmountInput from '../components/AmountInput.tsx'
import CategoryDialog from '../components/CategoryDialog.tsx'
import RecurringDialog from '../components/RecurringDialog.tsx'
import { signOutUser, useAuth } from '../lib/auth.ts'
import { exportBackup, isBackupStale, parseBackup } from '../lib/backup.ts'
import { iconFor } from '../lib/icons.tsx'
import { readLegacyData, removeLegacyData } from '../lib/legacy.ts'
import { formatEuros } from '../lib/money.ts'
import { useAppStore } from '../store/useAppStore.ts'
import type { Category, RecurringExpense } from '../types.ts'

export default function Settings() {
  const auth = useAuth()
  const categories = useAppStore((state) => state.categories)
  const plans = useAppStore((state) => state.plans)
  const expenses = useAppStore((state) => state.expenses)
  const lastExportAt = useAppStore((state) => state.lastExportAt)
  const removeCategory = useAppStore((state) => state.removeCategory)
  const markExported = useAppStore((state) => state.markExported)
  const importData = useAppStore((state) => state.importData)
  const recurring = useAppStore((state) => state.recurring)
  const removeRecurring = useAppStore((state) => state.removeRecurring)
  const annualGoal = useAppStore((state) => state.annualSavingsGoal)
  const setAnnualGoal = useAppStore((state) => state.setAnnualSavingsGoal)
  const themeMode = useAppStore((state) => state.themeMode)
  const setThemeMode = useAppStore((state) => state.setThemeMode)

  // `null` = closed, `'new'` = creating, otherwise editing that category
  const [editing, setEditing] = useState<Category | 'new' | null>(null)
  const [editingRecurring, setEditingRecurring] = useState<RecurringExpense | 'new' | null>(null)
  const [goal, setGoal] = useState(annualGoal)
  const [message, setMessage] = useState<{ severity: 'success' | 'error'; text: string } | null>(null)

  // Data left on this device by the version that had no cloud (read once when the screen opens)
  const [legacyData, setLegacyData] = useState(readLegacyData)

  const hasData = expenses.length > 0 || Object.keys(plans).length > 0

  const handleExport = async () => {
    try {
      await exportBackup({ version: 1, categories, plans, expenses, lastExportAt })
      markExported()
      setMessage({ severity: 'success', text: 'Copia exportada.' })
    } catch {
      // The user closing the share sheet also lands here, so no error is shown
    }
  }

  const handleImport = async (file: File | undefined) => {
    const data = file ? parseBackup(await file.text()) : null
    if (data) {
      importData(data)
      setMessage({ severity: 'success', text: 'Datos importados correctamente.' })
    } else {
      setMessage({ severity: 'error', text: 'El fichero no es una copia de seguridad válida.' })
    }
  }

  const handleUploadLegacy = () => {
    if (legacyData) {
      importData(legacyData)
      removeLegacyData()
      setLegacyData(null)
      setMessage({ severity: 'success', text: 'Datos del dispositivo subidos a tu cuenta.' })
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        Ajustes
      </Typography>

      {message ? <Alert severity={message.severity} onClose={() => setMessage(null)}>{message.text}</Alert> : null}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Cuenta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Has entrado como {auth.user?.email}. Tus datos se guardan en tu cuenta y los ves igual desde cualquier
              dispositivo.
            </Typography>
            {legacyData ? (
              <Alert
                severity="info"
                action={
                  <Button color="inherit" size="small" onClick={handleUploadLegacy}>
                    Subir
                  </Button>
                }
              >
                Hay datos guardados en este dispositivo de antes de crear la cuenta. Súbelos para no perderlos.
              </Alert>
            ) : null}
            <Button variant="outlined" onClick={() => signOutUser()}>
              Cerrar sesión
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Apariencia
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={themeMode}
              onChange={(_, value: typeof themeMode | null) => (value ? setThemeMode(value) : undefined)}
            >
              <ToggleButton value="system">Sistema</ToggleButton>
              <ToggleButton value="light">Claro</ToggleButton>
              <ToggleButton value="dark">Oscuro</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Meta de ahorro anual
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cuánto quieres ahorrar este año. Verás tu progreso en el Resumen. Déjala vacía para no usarla.
            </Typography>
            <AmountInput label="Meta del año" cents={goal} onChange={setGoal} />
            <Button
              variant="outlined"
              disabled={goal === annualGoal}
              onClick={() => {
                setAnnualGoal(goal)
                setMessage({ severity: 'success', text: 'Meta guardada.' })
              }}
            >
              Guardar meta
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Gastos recurrentes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Alquiler, suscripciones... Se apuntan solos cada mes, el día que elijas, al abrir la app.
            </Typography>
            {recurring.map((item) => (
              <Stack key={item.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <div style={{ flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatEuros(item.amount)} · día {item.day}
                  </Typography>
                </div>
                <IconButton aria-label={`Editar ${item.name}`} onClick={() => setEditingRecurring(item)}>
                  <EditOutlinedIcon />
                </IconButton>
                <IconButton aria-label={`Borrar ${item.name}`} onClick={() => removeRecurring(item.id)}>
                  <DeleteOutlinedIcon />
                </IconButton>
              </Stack>
            ))}
            <Button startIcon={<AddIcon />} onClick={() => setEditingRecurring('new')}>
              Añadir gasto recurrente
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Copia de seguridad
            </Typography>
            {isBackupStale(lastExportAt, hasData) ? (
              <Alert severity="warning">Hace más de 30 días de tu última copia. Conviene exportar una.</Alert>
            ) : null}
            <Typography variant="body2" color="text.secondary">
              Tus datos ya están en la nube. Aun así, exporta una copia de vez en cuando como respaldo extra.
            </Typography>
            <Button variant="contained" onClick={handleExport}>
              Exportar datos
            </Button>
            <Button variant="outlined" component="label">
              Importar datos
              <input
                type="file"
                accept="application/json,.json"
                hidden
                onChange={(event) => {
                  handleImport(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Categorías
            </Typography>
            {categories.map((category) => {
              const Icon = iconFor(category.icon)
              return (
                <Stack key={category.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: category.color }}>
                    <Icon />
                  </Avatar>
                  <Typography sx={{ flexGrow: 1 }}>{category.name}</Typography>
                  <IconButton aria-label={`Editar ${category.name}`} onClick={() => setEditing(category)}>
                    <EditOutlinedIcon />
                  </IconButton>
                  <IconButton aria-label={`Borrar ${category.name}`} onClick={() => removeCategory(category.id)}>
                    <DeleteOutlinedIcon />
                  </IconButton>
                </Stack>
              )
            })}
            <Button startIcon={<AddIcon />} onClick={() => setEditing('new')}>
              Añadir categoría
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Cómo instalar en iPhone
            </Typography>
            <Typography variant="body2">1. Abre esta web en Safari.</Typography>
            <Typography variant="body2">2. Pulsa Compartir y elige «Añadir a pantalla de inicio».</Typography>
            <Typography variant="body2">3. Usa siempre la app instalada desde tu pantalla de inicio.</Typography>
            <Typography variant="body2" color="text.secondary">
              Ojo: la app instalada y Safari no comparten la sesión. Inicia sesión una vez dentro de la app instalada y
              verás los mismos datos.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {editingRecurring ? (
        <RecurringDialog
          item={editingRecurring === 'new' ? undefined : editingRecurring}
          onClose={() => setEditingRecurring(null)}
        />
      ) : null}

      {editing ? (
        <CategoryDialog category={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
      ) : null}
    </Stack>
  )
}
