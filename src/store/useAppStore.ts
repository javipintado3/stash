import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { copyPlanToMonth, emptyPlan } from '../lib/budget.ts'
import {
  deleteCategoryDoc,
  deleteExpenseDoc,
  deleteRecurringDoc,
  logRecurringExpenses,
  replaceAllData,
  saveCategoryDoc,
  saveExpenseDoc,
  savePlanDoc,
  saveRecurringDoc,
  seedDefaultCategories,
  setAnnualSavingsGoalDoc,
  watchUserData,
} from '../lib/cloud.ts'
import { currentMonth, shiftMonth } from '../lib/months.ts'
import { dueRecurring } from '../lib/recurring.ts'
import type { Category, Expense, MonthPlan, RecurringExpense } from '../types.ts'

export const STORE_VERSION = 1

export type PersistedData = {
  version: number
  categories: Category[]
  plans: Record<string, MonthPlan>
  expenses: Expense[]
  lastExportAt: string | null
}

export type ThemeMode = 'system' | 'light' | 'dark'

type AppState = PersistedData & {
  recurring: RecurringExpense[]
  annualSavingsGoal: number
  themeMode: ThemeMode
  // The category of the last expense, so the next one starts with it selected
  lastCategoryId: string | null
  setThemeMode: (mode: ThemeMode) => void
  setAnnualSavingsGoal: (cents: number) => void
  saveRecurring: (item: RecurringExpense) => void
  removeRecurring: (id: string) => void
  // True once the first copy of the cloud data has arrived, so the screens never flash empty
  loaded: boolean
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
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'home', name: 'Casa', icon: 'home', color: '#2f5fa8' },
  { id: 'going-out', name: 'Salir', icon: 'nightlife', color: '#8b5cf6' },
  { id: 'groceries', name: 'Super', icon: 'cart', color: '#22c55e' },
  { id: 'shopping', name: 'Compras', icon: 'bag', color: '#f59e0b' },
]

// The signed-in user. Set by `connectStore`, every write goes to this user's data
let activeUid: string | null = null

// Writes are applied locally right away and synced later, so a failure is only logged
function write(task: (uid: string) => Promise<unknown>): void {
  if (activeUid) task(activeUid).catch((error: unknown) => console.error('Could not save to the cloud', error))
}

export const useAppStore = create<AppState>()(
  // Only a few preferences are kept on the device: everything else lives in Firestore
  persist(
    (set, get) => ({
      version: STORE_VERSION,
      categories: [],
      plans: {},
      expenses: [],
      lastExportAt: null,
      recurring: [],
      annualSavingsGoal: 0,
      themeMode: 'system',
      lastCategoryId: null,
      loaded: false,
      selectedMonth: currentMonth(),
      setSelectedMonth: (month) => set({ selectedMonth: month }),
      updatePlan: (month, update) => {
        const plan = update(get().plans[month] ?? emptyPlan(month))
        write((uid) => savePlanDoc(uid, plan))
      },
      // Copies the closest earlier plan (up to 24 months back) into the given month
      copyPreviousMonth: (month) => {
        const { plans } = get()
        const source = Array.from({ length: 24 }, (_, index) => plans[shiftMonth(month, -(index + 1))]).find(
          (plan) => plan !== undefined,
        )
        if (source) write((uid) => savePlanDoc(uid, copyPlanToMonth(source, month)))
      },
      addExpense: (expense) => {
        set({ lastCategoryId: expense.categoryId })
        write((uid) => saveExpenseDoc(uid, expense))
      },
      updateExpense: (expense) => write((uid) => saveExpenseDoc(uid, expense)),
      removeExpense: (id) => write((uid) => deleteExpenseDoc(uid, id)),
      saveCategory: (category) => write((uid) => saveCategoryDoc(uid, category)),
      removeCategory: (id) => {
        const plansToUpdate = Object.values(get().plans)
          .filter((plan) => plan.budgets.some((budget) => budget.categoryId === id))
          .map((plan) => ({ ...plan, budgets: plan.budgets.filter((budget) => budget.categoryId !== id) }))
        write((uid) => deleteCategoryDoc(uid, id, plansToUpdate))
      },
      setThemeMode: (mode) => set({ themeMode: mode }),
      setAnnualSavingsGoal: (cents) => write((uid) => setAnnualSavingsGoalDoc(uid, cents)),
      // If its day has already passed this month, the expense is logged right away
      saveRecurring: (item) => {
        const today = new Date()
        const due = dueRecurring([item], currentMonth(), today.getDate())
        write((uid) => (due.length > 0 ? logRecurringExpenses(uid, due, currentMonth()) : saveRecurringDoc(uid, item)))
      },
      removeRecurring: (id) => write((uid) => deleteRecurringDoc(uid, id)),
      markExported: () => set({ lastExportAt: new Date().toISOString() }),
      importData: (data) => {
        const { categories, plans, expenses } = get()
        write((uid) =>
          replaceAllData(
            uid,
            { categories, plans, expenses },
            { categories: data.categories, plans: data.plans, expenses: data.expenses },
          ),
        )
      },
    }),
    {
      name: 'stash-device',
      version: STORE_VERSION,
      partialize: (state) => ({
        lastExportAt: state.lastExportAt,
        themeMode: state.themeMode,
        lastCategoryId: state.lastCategoryId,
      }),
    },
  ),
)

// A month without a plan starts as a copy of the closest earlier one, so only the changes need editing
function prepareCurrentMonth(): void {
  const { plans, copyPreviousMonth } = useAppStore.getState()
  if (plans[currentMonth()] === undefined) copyPreviousMonth(currentMonth())
}

// Logs the recurring expenses whose day has arrived. Runs once per sign in, when the data is loaded
function logDueRecurring(): void {
  const month = currentMonth()
  const due = dueRecurring(useAppStore.getState().recurring, month, new Date().getDate())
  if (due.length > 0) write((uid) => logRecurringExpenses(uid, due, month))
}

// Called by the auth module when the user signs in (uid) or out (null)
let stopWatching: (() => void) | null = null

export function connectStore(uid: string | null): void {
  stopWatching?.()
  stopWatching = null
  activeUid = uid
  useAppStore.setState({ categories: [], plans: {}, expenses: [], recurring: [], annualSavingsGoal: 0, loaded: false })
  if (uid === null) return

  // `loaded` flips once every source has delivered its first snapshot
  const pending = new Set(['categories', 'plans', 'expenses', 'recurring', 'settings'])
  const arrived = (name: string) => {
    const wasPending = pending.delete(name)
    if (wasPending && pending.size === 0) {
      useAppStore.setState({ loaded: true })
      prepareCurrentMonth()
      logDueRecurring()
    }
  }

  stopWatching = watchUserData(uid, {
    onCategories: (categories) => {
      useAppStore.setState({ categories })
      arrived('categories')
    },
    onPlans: (plans) => {
      useAppStore.setState({ plans })
      arrived('plans')
    },
    onExpenses: (expenses) => {
      useAppStore.setState({ expenses })
      arrived('expenses')
    },
    onRecurring: (recurring) => {
      useAppStore.setState({ recurring })
      arrived('recurring')
    },
    onSettings: ({ annualSavingsGoal }) => {
      useAppStore.setState({ annualSavingsGoal })
      arrived('settings')
    },
  })

  // Fails harmlessly when offline the very first time, it is retried on the next sign in
  seedDefaultCategories(uid, DEFAULT_CATEGORIES).catch((error: unknown) => console.error('Could not seed categories', error))
}
