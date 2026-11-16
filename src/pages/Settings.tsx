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
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import CategoryDialog from '../components/CategoryDialog.tsx'
import { exportBackup, isBackupStale, parseBackup } from '../lib/backup.ts'
import { iconFor } from '../lib/icons.tsx'
import { useAppStore } from '../store/useAppStore.ts'
import type { Category } from '../types.ts'

export default function Settings() {
  const categories = useAppStore((state) => state.categories)
  const plans = useAppStore((state) => state.plans)
  const expenses = useAppStore((state) => state.expenses)
  const lastExportAt = useAppStore((state) => state.lastExportAt)
  const removeCategory = useAppStore((state) => state.removeCategory)
  const markExported = useAppStore((state) => state.markExported)
  const importData = useAppStore((state) => state.importData)

  // `null` = closed, `'new'` = creating, otherwise editing that category
  const [editing, setEditing] = useState<Category | 'new' | null>(null)
  const [message, setMessage] = useState<{ severity: 'success' | 'error'; text: string } | null>(null)

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
              Copia de seguridad
            </Typography>
            {isBackupStale(lastExportAt, hasData) ? (
              <Alert severity="warning">Hace más de 30 días de tu última copia. Conviene exportar una.</Alert>
            ) : null}
            <Typography variant="body2" color="text.secondary">
              Tus datos viven solo en este dispositivo. Exporta una copia de vez en cuando por si cambias de móvil.
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
              Ojo: la app instalada y la web abierta en Safari no comparten datos. Si ya apuntaste cosas en Safari,
              expórtalas y súbelas con «Importar datos» desde la app instalada.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {editing ? (
        <CategoryDialog category={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />
      ) : null}
    </Stack>
  )
}
