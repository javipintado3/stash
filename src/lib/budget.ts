import type { Expense, MonthPlan } from '../types.ts'

export type BudgetStatus = 'ok' | 'warning' | 'over'

export function fixedTotal(plan: MonthPlan): number {
  return plan.fixedItems.reduce((sum, item) => sum + item.amount, 0)
}

export function budgetsTotal(plan: MonthPlan): number {
  return plan.budgets.reduce((sum, budget) => sum + budget.amount, 0)
}

export function unassigned(plan: MonthPlan): number {
  return plan.income - plan.savingsGoal - fixedTotal(plan) - budgetsTotal(plan)
}

export function spentInCategory(expenses: Expense[], month: string, categoryId: string): number {
  return expenses
    .filter((expense) => expense.month === month && expense.categoryId === categoryId)
    .reduce((sum, expense) => sum + expense.amount, 0)
}

export function totalSpent(expenses: Expense[], month: string): number {
  return expenses
    .filter((expense) => expense.month === month)
    .reduce((sum, expense) => sum + expense.amount, 0)
}

export function remaining(budgetAmount: number, spent: number): number {
  return budgetAmount - spent
}

// Real savings = what is left of the income after fixed contributions and all spending.
export function realSavings(plan: MonthPlan, expenses: Expense[]): number {
  return plan.income - fixedTotal(plan) - totalSpent(expenses, plan.month)
}

export function budgetStatus(budgetAmount: number, spent: number): BudgetStatus {
  return spent > budgetAmount ? 'over' : budgetAmount > 0 && spent >= budgetAmount * 0.8 ? 'warning' : 'ok'
}

export function copyPlanToMonth(plan: MonthPlan, month: string): MonthPlan {
  return {
    ...plan,
    month,
    fixedItems: plan.fixedItems.map((item) => ({ ...item })),
    budgets: plan.budgets.map((budget) => ({ ...budget })),
  }
}

export function emptyPlan(month: string): MonthPlan {
  return { month, income: 0, savingsGoal: 0, fixedItems: [], budgets: [] }
}
