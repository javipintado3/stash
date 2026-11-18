import type { Expense, MonthPlan } from '../types.ts'
import {
  budgetStatus,
  categoryAlerts,
  copyPlanToMonth,
  monthlySavings,
  realSavings,
  remaining,
  spentInCategory,
  unassigned,
  yearSavings,
} from './budget.ts'
import { centsToInput, parseEurosToCents } from './money.ts'
import { shiftMonth } from './months.ts'

const plan: MonthPlan = {
  month: '2026-11',
  income: 180000,
  savingsGoal: 60000,
  fixedItems: [{ id: 'parents', name: 'Padres', amount: 20000 }],
  budgets: [
    { categoryId: 'home', amount: 50000 },
    { categoryId: 'going-out', amount: 30000 },
  ],
}

const expenses: Expense[] = [
  { id: '1', month: '2026-11', categoryId: 'home', amount: 12000, date: '2026-11-03' },
  { id: '2', month: '2026-11', categoryId: 'home', amount: 3550, date: '2026-11-05' },
  { id: '3', month: '2026-11', categoryId: 'going-out', amount: 8000, date: '2026-11-06' },
  { id: '4', month: '2026-10', categoryId: 'home', amount: 99999, date: '2026-10-06' },
]

describe('unassigned', () => {
  it('subtracts savings, fixed items and budgets from the income', () => {
    expect(unassigned(plan)).toBe(20000)
  })

  it('is negative when the plan is over the income', () => {
    expect(unassigned({ ...plan, income: 100000 })).toBe(-60000)
  })
})

describe('spending', () => {
  it('only counts expenses of the same month and category', () => {
    expect(spentInCategory(expenses, '2026-11', 'home')).toBe(15550)
  })

  it('computes the remaining amount, which can be negative', () => {
    expect(remaining(10000, 15000)).toBe(-5000)
  })

  it('computes real savings against the monthly total spent', () => {
    expect(realSavings(plan, expenses)).toBe(180000 - 20000 - 23550)
  })
})

describe('budgetStatus', () => {
  it('is ok below 80%', () => expect(budgetStatus(10000, 7999)).toBe('ok'))
  it('is warning from 80% up to the limit', () => expect(budgetStatus(10000, 10000)).toBe('warning'))
  it('is over above the limit', () => expect(budgetStatus(10000, 10001)).toBe('over'))
})

describe('copyPlanToMonth', () => {
  it('copies the plan without sharing references', () => {
    const copy = copyPlanToMonth(plan, '2026-12')
    expect(copy.month).toBe('2026-12')
    expect(copy.budgets).toEqual(plan.budgets)
    expect(copy.budgets).not.toBe(plan.budgets)
  })
})

describe('money', () => {
  it('parses Spanish and plain decimal input into cents', () => {
    expect(parseEurosToCents('12,5')).toBe(1250)
    expect(parseEurosToCents('1.234,56')).toBe(123456)
    expect(parseEurosToCents('35.10')).toBe(3510)
    expect(parseEurosToCents('abc')).toBe(0)
  })

  it('converts cents back to an input string', () => {
    expect(centsToInput(1250)).toBe('12,5')
    expect(centsToInput(0)).toBe('')
  })
})

describe('shiftMonth', () => {
  it('crosses year boundaries', () => {
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
    expect(shiftMonth('2026-01', -1)).toBe('2025-12')
  })
})

describe('categoryAlerts', () => {
  const categories = [
    { id: 'home', name: 'Casa', icon: 'home', color: '#000' },
    { id: 'going-out', name: 'Salir', icon: 'nightlife', color: '#000' },
    { id: 'shopping', name: 'Compras', icon: 'bag', color: '#000' },
  ]

  it('flags categories at 80 % and beyond, the exceeded ones first', () => {
    const spending: Expense[] = [
      { id: 'a', month: '2026-11', categoryId: 'home', amount: 42000, date: '2026-11-03' },
      { id: 'b', month: '2026-11', categoryId: 'going-out', amount: 35000, date: '2026-11-04' },
    ]
    const alerts = categoryAlerts(plan, spending, categories)
    expect(alerts.map((alert) => [alert.category.id, alert.status, alert.percent])).toEqual([
      ['going-out', 'over', 117],
      ['home', 'warning', 84],
    ])
  })

  it('returns nothing while every category is under 80 %', () => {
    expect(categoryAlerts(plan, expenses, categories)).toEqual([])
  })

  it('flags spending in a category with no budget as exceeded', () => {
    const spending: Expense[] = [{ id: 'c', month: '2026-11', categoryId: 'shopping', amount: 1000, date: '2026-11-07' }]
    expect(categoryAlerts(plan, spending, categories).map((alert) => alert.status)).toEqual(['over'])
  })
})

describe('yearSavings and monthlySavings', () => {
  const plans = {
    '2026-10': { ...plan, month: '2026-10' },
    '2026-11': plan,
    '2025-12': { ...plan, month: '2025-12' },
  }

  it('adds up the real savings of the months of the year that have a plan', () => {
    // October: 180000 - 20000 - 99999, November: 180000 - 20000 - 23550
    expect(yearSavings(plans, expenses, '2026')).toBe(60001 + 136450)
  })

  it('lists the savings and goal of each month, zero when there is no plan', () => {
    expect(monthlySavings(plans, expenses, ['2026-09', '2026-11'])).toEqual([
      { month: '2026-09', savings: 0, goal: 0 },
      { month: '2026-11', savings: 136450, goal: 60000 },
    ])
  })
})
