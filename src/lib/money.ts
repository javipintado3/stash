const euroFormatter = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' })

export function formatEuros(cents: number): string {
  return euroFormatter.format(cents / 100)
}

// Parses user input such as "12,5", "12.50" or "1.234,56" into cents. Returns 0 for invalid input.
export function parseEurosToCents(input: string): number {
  const trimmed = input.trim().replace(/\s/g, '')
  const normalized = trimmed.includes(',') ? trimmed.replace(/\./g, '').replace(',', '.') : trimmed
  const value = Number(normalized)
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : 0
}

export function centsToInput(cents: number): string {
  return cents === 0 ? '' : String(cents / 100).replace('.', ',')
}
