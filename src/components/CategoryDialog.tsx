import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useRef, useState } from 'react'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../lib/icons.tsx'
import { useAppStore } from '../store/useAppStore.ts'
import type { Category } from '../types.ts'

type CategoryDialogProps = {
  category?: Category
  onClose: () => void
}

// Render this component only while open, so its form state starts fresh each time
export default function CategoryDialog({ category, onClose }: CategoryDialogProps) {
  const saveCategory = useAppStore((state) => state.saveCategory)
  const nameRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(category?.name ?? '')
  const [icon, setIcon] = useState(category?.icon ?? 'other')
  const [color, setColor] = useState(category?.color ?? CATEGORY_COLORS[0])

  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ transition: { onEntered: () => nameRef.current?.focus() } }}
    >
      <DialogTitle>{category ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Nombre" value={name} onChange={(event) => setName(event.target.value)} fullWidth inputRef={nameRef} />
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(CATEGORY_ICONS).map(([key, Icon]) => (
              <IconButton
                key={key}
                aria-label={`Icono ${key}`}
                onClick={() => setIcon(key)}
                sx={{ bgcolor: icon === key ? color : 'action.hover', color: icon === key ? 'common.white' : 'inherit' }}
              >
                <Icon />
              </IconButton>
            ))}
          </Stack>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {CATEGORY_COLORS.map((option) => (
              <IconButton key={option} aria-label={`Color ${option}`} onClick={() => setColor(option)}>
                <Avatar
                  sx={{
                    bgcolor: option,
                    width: 32,
                    height: 32,
                    outline: color === option ? '3px solid' : 'none',
                    outlineOffset: 2,
                  }}
                >
                  {' '}
                </Avatar>
              </IconButton>
            ))}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={name.trim() === ''}
          onClick={() => {
            saveCategory({ id: category?.id ?? crypto.randomUUID(), name: name.trim(), icon, color })
            onClose()
          }}
        >
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
