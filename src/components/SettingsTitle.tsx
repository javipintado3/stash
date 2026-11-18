import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

type SettingsTitleProps = {
  icon: ReactNode
  children: string
}

// Title of a Settings card, with a colored icon so the sections are easy to tell apart
export default function SettingsTitle({ icon, children }: SettingsTitleProps) {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'primary.main' }}>
      {icon}
      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
        {children}
      </Typography>
    </Stack>
  )
}
