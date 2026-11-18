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
  {
    title: '1. Planifica el mes',
    text: 'En Plan, escribe tu sueldo, lo que quieres ahorrar y tus aportaciones fijas. Después reparte el resto entre tus categorías. Arriba verás siempre cuánto te queda por repartir.',
  },
  {
    title: '2. Apunta tus gastos',
    text: 'Pulsa el botón + y escribe el importe. Toca una categoría y guarda. Se queda marcada la última que usaste para ir más rápido.',
  },
  {
    title: '3. Mira cómo vas',
    text: 'En Resumen ves cuánto llevas gastado y cuánto te queda en cada categoría. Te avisa al llegar al 80 % y cuando te pasas. También ves tu ahorro real frente a tu meta.',
  },
  {
    title: '4. Mes siguiente',
    text: 'Al abrir un mes nuevo, la app copia el plan anterior para que solo cambies lo que sea distinto. Cada mes es independiente de los demás.',
  },
  {
    title: 'Otras cosas útiles',
    text: 'En Ajustes puedes crear gastos recurrentes que se apuntan solos, poner una meta de ahorro anual, cambiar tus categorías y hacer una copia de seguridad. Tus datos están en tu cuenta: los ves igual desde cualquier dispositivo.',
  },
]

export default function HelpDialog({ onClose }: HelpDialogProps) {
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs" scroll="paper">
      <DialogTitle>Cómo funciona Stash</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {STEPS.map((step) => (
            <div key={step.title}>
              <Typography sx={{ fontWeight: 800 }}>{step.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {step.text}
              </Typography>
            </div>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  )
}
