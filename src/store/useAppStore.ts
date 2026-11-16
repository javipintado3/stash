import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { copyPlanToMonth, emptyPlan } from '../lib/budget.ts'
import { currentMonth, shiftMonth } from '../lib/months.ts'
import type { Category, Expense, MonthPlan } from '../types.ts'

export const STORE_VERSION = 1

export type PersistedData = {
  version: number
  categories: Category[]
  plans: Record<string, MonthPlan>
  expenses: Expense[]
  lastExportAt: string | null
}

type AppState = PersistedData & {
  selectedMonth: string
  setSelectedMonth: (month: string) => void
  updatePlan: (month: string, update: (plan: MonthPlan) => MonthPlan) => void
  copyPreviousMonth: (month: string) => void
  addExpense: (expense: Expense) => void
  updateExpense: (expense: Expense) => void
  removeExpense: (id: string) => void
  saveCategory: (category: Category) => void
  removeCategory: (id: string) => void
  markExported: () => void
  importData: (data: PersistedData) => void
  resetData: () => void
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'home', name: 'Casa', icon: 'home', color: '#00AEEF' },
  { id: 'going-out', name: 'Salir', icon: 'nightlife', color: '#8b5cf6' },
  { id: 'groceries', name: 'Super', icon: 'cart', color: '#22c55e' },
  { id: 'shopping', name: 'Compras', icon: 'bag', color: '#f59e0b' },
]

const initialData: PersistedData = {
  version: STORE_VERSION,
  categories: DEFAULT_CATEGORIES,
  plans: {},
  expenses: [],
  lastExportAt: null,
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialData,
      selectedMonth: currentMonth(),
      setSelectedMonth: (month) => set({ selectedMonth: month }),
      updatePlan: (month, update) =>
        set((state) => ({
          plans: { ...state.plans, [month]: update(state.plans[month] ?? emptyPlan(month)) },
        })),
      // Copies the closest earlier plan (up to 24 months back) into the given month
      copyPreviousMonth: (month) =>
        set((state) => {
          const source = Array.from({ length: 24 }, (_, index) => state.plans[shiftMonth(month, -(index + 1))]).find(
            (plan) => plan !== undefined,
          )
          return source ? { plans: { ...state.plans, [month]: copyPlanToMonth(source, month) } } : state
        }),
      addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
      updateExpense: (expense) =>
        set((state) => ({ expenses: state.expenses.map((item) => (item.id === expense.id ? expense : item)) })),
      removeExpense: (id) => set((state) => ({ expenses: state.expenses.filter((item) => item.id !== id) })),
      saveCategory: (category) =>
        set((state) => ({
          categories: state.categories.some((item) => item.id === category.id)
            ? state.categories.map((item) => (item.id === category.id ? category : item))
            : [...state.categories, category],
        })),
      removeCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((item) => item.id !== id),
          plans: Object.fromEntries(
            Object.entries(state.plans).map(([month, plan]) => [
              month,
              { ...plan, budgets: plan.budgets.filter((budget) => budget.categoryId !== id) },
            ]),
          ),
        })),
      markExported: () => set({ lastExportAt: new Date().toISOString() }),
      importData: (data) => set({ ...data, version: STORE_VERSION }),
      resetData: () => set({ ...initialData }),
    }),
    {
      name: 'ahorro-data',
      version: STORE_VERSION,
      partialize: (state): PersistedData => ({
        version: state.version,
        categories: state.categories,
        plans: state.plans,
        expenses: state.expenses,
        lastExportAt: state.lastExportAt,
      }),
      // Future migrations go here, switching on the stored version
      migrate: (persisted) => persisted as PersistedData,
    },
  ),
)
