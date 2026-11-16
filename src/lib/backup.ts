import { STORE_VERSION, type PersistedData } from '../store/useAppStore.ts'

const STALE_BACKUP_DAYS = 30

export function serializeBackup(data: PersistedData): string {
  return JSON.stringify({ ...data, version: STORE_VERSION }, null, 2)
}

// Returns the parsed data when the text looks like a valid backup, otherwise null
export function parseBackup(text: string): PersistedData | null {
  try {
    const data: unknown = JSON.parse(text)
    if (typeof data !== 'object' || data === null) return null
    const candidate = data as Partial<PersistedData>
    return Array.isArray(candidate.categories) &&
      Array.isArray(candidate.expenses) &&
      typeof candidate.plans === 'object' &&
      candidate.plans !== null
      ? {
          version: STORE_VERSION,
          categories: candidate.categories,
          expenses: candidate.expenses,
          plans: candidate.plans,
          lastExportAt: candidate.lastExportAt ?? null,
        }
      : null
  } catch {
    return null
  }
}

// Uses the native share sheet when it can share files (iOS), otherwise downloads the file
export async function exportBackup(data: PersistedData): Promise<void> {
  const fileName = `ahorro-copia-${new Date().toISOString().slice(0, 10)}.json`
  const file = new File([serializeBackup(data)], fileName, { type: 'application/json' })

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'Copia de seguridad de Ahorro' })
    return
  }

  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export function isBackupStale(lastExportAt: string | null, hasData: boolean): boolean {
  return hasData
    ? lastExportAt === null || Date.now() - new Date(lastExportAt).getTime() > STALE_BACKUP_DAYS * 86_400_000
    : false
}
