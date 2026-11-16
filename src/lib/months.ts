export function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function currentMonth(): string {
  return toMonthKey(new Date())
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split('-').map(Number)
  return toMonthKey(new Date(year, monthNumber - 1 + delta, 1))
}

export function monthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const label = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(
    new Date(year, monthNumber - 1, 1),
  )
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function todayIso(): string {
  const now = new Date()
  return `${toMonthKey(now)}-${String(now.getDate()).padStart(2, '0')}`
}
