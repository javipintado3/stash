import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { copyPlanToMonth, emptyPlan } from '../lib/budget.ts'
import {
  deleteCategoryDoc,
  deleteExpenseDoc,
  replaceAllData,
  saveCategoryDoc,
  saveExpenseDoc,
  savePlanDoc,
  seedDefaultCategories,
  watchUserData,
} from '../lib/cloud.ts'
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
  { id: 'home', name: 'Casa', icon: 'home', color: '#00AEEF' },
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
  // Only `lastExportAt` is kept on the device: everything else lives in Firestore
  persist(
    (set, get) => ({
      version: STORE_VERSION,
      categories: [],
      plans: {},
      expenses: [],
      lastExportAt: null,
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
      addExpense: (expense) => write((uid) => saveExpenseDoc(uid, expense)),
      updateExpense: (expense) => write((uid) => saveExpenseDoc(uid, expense)),
      removeExpense: (id) => write((uid) => deleteExpenseDoc(uid, id)),
      saveCategory: (category) => write((uid) => saveCategoryDoc(uid, category)),
      removeCategory: (id) => {
        const plansToUpdate = Object.values(get().plans)
          .filter((plan) => plan.budgets.some((budget) => budget.categoryId === id))
          .map((plan) => ({ ...plan, budgets: plan.budgets.filter((budget) => budget.categoryId !== id) }))
        write((uid) => deleteCategoryDoc(uid, id, plansToUpdate))
      },
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
      partialize: (state) => ({ lastExportAt: state.lastExportAt }),
    },
  ),
)

// Called by the auth module when the user signs in (uid) or out (null)
let stopWatching: (() => void) | null = null

export function connectStore(uid: string | null): void {
  stopWatching?.()
  stopWatching = null
  activeUid = uid
  useAppStore.setState({ categories: [], plans: {}, expenses: [], loaded: false })
  if (uid === null) return

  // `loaded` flips once the three collections have delivered their first snapshot
  const pending = new Set(['categories', 'plans', 'expenses'])
  const arrived = (name: string) => {
    pending.delete(name)
    if (pending.size === 0) useAppStore.setState({ loaded: true })
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
  })

  // Fails harmlessly when offline the very first time, it is retried on the next sign in
  seedDefaultCategories(uid, DEFAULT_CATEGORIES).catch((error: unknown) => console.error('Could not seed categories', error))
}
