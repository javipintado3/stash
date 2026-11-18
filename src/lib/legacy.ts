import { STORE_VERSION, type PersistedData } from '../store/useAppStore.ts'
import { parseBackup } from './backup.ts'

// Before the cloud, the data was kept in this key of the device's local storage
const LEGACY_KEY = 'ahorro-data'

// Returns the data saved on this device by the old version, or null when there is none worth uploading
export function readLegacyData(): PersistedData | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    const state: unknown = raw ? (JSON.parse(raw) as { state?: unknown }).state : null
    const data = state ? parseBackup(JSON.stringify({ ...(state as object), version: STORE_VERSION })) : null
    return data && (data.expenses.length > 0 || Object.keys(data.plans).length > 0) ? data : null
  } catch {
    return null
  }
}

export function removeLegacyData(): void {
  try {
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    // Nothing to remove when the storage is not available
  }
}
