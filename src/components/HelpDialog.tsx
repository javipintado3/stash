import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type HelpDialogProps = {
  onClose: () => void
}

const STEPS = [
  { title: '1. Planifica el mes', text: 'En Planificar pon tu sueldo, tu ahorro y lo fijo. Reparte el resto entre tus categorías.' },
  { title: '2. Apunta tus gastos', text: 'Pulsa + , escribe el importe, toca una categoría y guarda.' },
  { title: '3. Mira cómo vas', text: 'En Resumen ves lo gastado y lo que queda en cada categoría. Te avisa al llegar al 80 %.' },
  { title: '4. Mes nuevo', text: 'La app copia el plan anterior. Solo cambias lo que sea distinto.' },
  { title: 'Y además', text: 'En Ajustes: gastos recurrentes, meta anual, categorías y copia de seguridad.' },
]

export default function HelpDialog({ onClose }: HelpDialogProps) {
  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      scroll="paper"
      sx={{ '& .MuiDialog-paper': { m: 2, width: 'calc(100% - 32px)' } }}
    >
      <DialogTitle sx={{ pb: 1 }}>Cómo funciona Stash</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Stack spacing={2}>
          {STEPS.map((step) => (
            <div key={step.title}>
              <Typography sx={{ fontWeight: 800 }}>{step.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                {step.text}
              </Typography>
            </div>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" fullWidth onClick={onClose}>
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  )
}
