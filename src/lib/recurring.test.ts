import type { RecurringExpense } from '../types.ts'
import { dueRecurring, recurringExpenseFor } from './recurring.ts'

const rent: RecurringExpense = { id: 'rent', name: 'Alquiler', categoryId: 'home', amount: 45000, day: 5 }

describe('dueRecurring', () => {
  it('is due once its day has arrived and it was not logged this month', () => {
    expect(dueRecurring([rent], '2026-11', 5)).toEqual([rent])
    expect(dueRecurring([rent], '2026-11', 20)).toEqual([rent])
  })

  it('is not due before its day', () => {
    expect(dueRecurring([rent], '2026-11', 4)).toEqual([])
  })

  it('is not due again after being logged this month', () => {
    expect(dueRecurring([{ ...rent, lastGenerated: '2026-11' }], '2026-11', 20)).toEqual([])
  })

  it('is due again the next month', () => {
    expect(dueRecurring([{ ...rent, lastGenerated: '2026-11' }], '2026-12', 5)).toHaveLength(1)
  })
})

describe('recurringExpenseFor', () => {
  it('builds the expense with a fixed id and the day of the month', () => {
    expect(recurringExpenseFor(rent, '2026-11')).toEqual({
      id: 'rec-rent-2026-11',
      month: '2026-11',
      categoryId: 'home',
      amount: 45000,
      note: 'Alquiler',
      date: '2026-11-05',
    })
  })
})
