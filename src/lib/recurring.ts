import type { Expense, RecurringExpense } from '../types.ts'

// The recurring expenses that must be logged this month: their day has arrived and they were not logged yet
export function dueRecurring(items: RecurringExpense[], month: string, dayOfMonth: number): RecurringExpense[] {
  return items.filter((item) => (item.lastGenerated ?? '') < month && item.day <= dayOfMonth)
}

// The id is fixed per item and month, so logging it twice (e.g. from two devices) never duplicates it
export function recurringExpenseFor(item: RecurringExpense, month: string): Expense {
  return {
    id: `rec-${item.id}-${month}`,
    month,
    categoryId: item.categoryId,
    amount: item.amount,
    note: item.name,
    date: `${month}-${String(item.day).padStart(2, '0')}`,
  }
}
