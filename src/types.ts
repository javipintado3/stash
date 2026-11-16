export type Category = { id: string; name: string; icon: string; color: string }

export type FixedItem = { id: string; name: string; amount: number }

export type Budget = { categoryId: string; amount: number }

// All amounts are integer cents. `month` is formatted as "YYYY-MM".
export type MonthPlan = {
  month: string
  income: number
  savingsGoal: number
  fixedItems: FixedItem[]
  budgets: Budget[]
}

export type Expense = {
  id: string
  month: string
  categoryId: string
  amount: number
  note?: string
  date: string
}
