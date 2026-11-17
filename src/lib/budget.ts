import type { Category, Expense, MonthPlan } from '../types.ts'

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

export type CategoryAlert = { category: Category; status: 'warning' | 'over'; percent: number; spent: number; budget: number }

// Categories at 80 % or more of their budget (warning) or beyond it (over), most urgent first
export function categoryAlerts(plan: MonthPlan, expenses: Expense[], categories: Category[]): CategoryAlert[] {
  return categories
    .flatMap((category) => {
      const budget = plan.budgets.find((item) => item.categoryId === category.id)?.amount ?? 0
      const spent = spentInCategory(expenses, plan.month, category.id)
      const status = budgetStatus(budget, spent)
      return status === 'ok'
        ? []
        : [{ category, status, percent: budget > 0 ? Math.round((spent / budget) * 100) : 100, spent, budget }]
    })
    .sort((a, b) => Number(b.status === 'over') - Number(a.status === 'over') || b.percent - a.percent)
}

// Real savings added up over the months of a year ("YYYY") that have a plan
export function yearSavings(plans: Record<string, MonthPlan>, expenses: Expense[], year: string): number {
  return Object.values(plans)
    .filter((plan) => plan.month.startsWith(`${year}-`))
    .reduce((sum, plan) => sum + realSavings(plan, expenses), 0)
}

export type MonthlySavings = { month: string; savings: number; goal: number }

// Real savings and goal for each of the given months (zero when the month has no plan)
export function monthlySavings(plans: Record<string, MonthPlan>, expenses: Expense[], months: string[]): MonthlySavings[] {
  return months.map((month) => {
    const plan = plans[month]
    return { month, savings: plan ? realSavings(plan, expenses) : 0, goal: plan?.savingsGoal ?? 0 }
  })
}
