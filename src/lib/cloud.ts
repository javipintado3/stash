import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  writeBatch,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore'
import type { Category, Expense, MonthPlan } from '../types.ts'
import { requireFirebase } from './firebase.ts'

// Layout in Firestore, everything hangs from the signed-in user:
//   users/{uid}                    -> { seeded: true } once the default categories were created
//   users/{uid}/categories/{id}
//   users/{uid}/plans/{month}      -> the document id is the "YYYY-MM" month
//   users/{uid}/expenses/{id}
// The security rules (firestore.rules) only let each user touch their own subtree.

// Firestore allows 500 operations per batch
const BATCH_SIZE = 400

type Handlers = {
  onCategories: (categories: Category[]) => void
  onPlans: (plans: Record<string, MonthPlan>) => void
  onExpenses: (expenses: Expense[]) => void
}

function userDoc(db: Firestore, uid: string) {
  return doc(db, 'users', uid)
}

function items(db: Firestore, uid: string, name: 'categories' | 'plans' | 'expenses') {
  return collection(db, 'users', uid, name)
}

// Starts listening to the user's data and returns the function that stops it
export function watchUserData(uid: string, handlers: Handlers): () => void {
  const { db } = requireFirebase()
  const stopCategories = onSnapshot(items(db, uid, 'categories'), (snapshot) =>
    handlers.onCategories(snapshot.docs.map((item) => item.data() as Category)),
  )
  const stopPlans = onSnapshot(items(db, uid, 'plans'), (snapshot) =>
    handlers.onPlans(Object.fromEntries(snapshot.docs.map((item) => [item.id, item.data() as MonthPlan]))),
  )
  const stopExpenses = onSnapshot(items(db, uid, 'expenses'), (snapshot) =>
    handlers.onExpenses(snapshot.docs.map((item) => item.data() as Expense)),
  )
  return () => {
    stopCategories()
    stopPlans()
    stopExpenses()
  }
}

// Creates the default categories the first time an account is used
export async function seedDefaultCategories(uid: string, categories: Category[]): Promise<void> {
  const { db } = requireFirebase()
  const user = await getDoc(userDoc(db, uid))
  if (user.exists() && user.data().seeded) return
  const batch = writeBatch(db)
  categories.forEach((category) => batch.set(doc(items(db, uid, 'categories'), category.id), category))
  batch.set(userDoc(db, uid), { seeded: true }, { merge: true })
  await batch.commit()
}

export function saveCategoryDoc(uid: string, category: Category): Promise<void> {
  const { db } = requireFirebase()
  return setDoc(doc(items(db, uid, 'categories'), category.id), category)
}

// Deletes the category and removes its budget from every plan that used it
export async function deleteCategoryDoc(uid: string, id: string, plansToUpdate: MonthPlan[]): Promise<void> {
  const { db } = requireFirebase()
  const batch = writeBatch(db)
  batch.delete(doc(items(db, uid, 'categories'), id))
  plansToUpdate.forEach((plan) => batch.set(doc(items(db, uid, 'plans'), plan.month), plan))
  await batch.commit()
}

export function savePlanDoc(uid: string, plan: MonthPlan): Promise<void> {
  const { db } = requireFirebase()
  return setDoc(doc(items(db, uid, 'plans'), plan.month), plan)
}

export function saveExpenseDoc(uid: string, expense: Expense): Promise<void> {
  const { db } = requireFirebase()
  return setDoc(doc(items(db, uid, 'expenses'), expense.id), expense)
}

export function deleteExpenseDoc(uid: string, id: string): Promise<void> {
  const { db } = requireFirebase()
  return deleteDoc(doc(items(db, uid, 'expenses'), id))
}

type Snapshot = { categories: Category[]; plans: Record<string, MonthPlan>; expenses: Expense[] }

// Makes the cloud data equal to `next`: writes everything in it and deletes what is no longer there
export async function replaceAllData(uid: string, current: Snapshot, next: Snapshot): Promise<void> {
  const { db } = requireFirebase()
  const operations: ((batch: ReturnType<typeof writeBatch>) => void)[] = []

  const sync = <T extends DocumentData>(
    name: 'categories' | 'plans' | 'expenses',
    currentIds: string[],
    nextEntries: [string, T][],
  ) => {
    const nextIds = new Set(nextEntries.map(([id]) => id))
    currentIds
      .filter((id) => !nextIds.has(id))
      .forEach((id) => operations.push((batch) => batch.delete(doc(items(db, uid, name), id))))
    nextEntries.forEach(([id, data]) => operations.push((batch) => batch.set(doc(items(db, uid, name), id), data)))
  }

  sync(
    'categories',
    current.categories.map((item) => item.id),
    next.categories.map((item) => [item.id, item]),
  )
  sync('plans', Object.keys(current.plans), Object.entries(next.plans))
  sync(
    'expenses',
    current.expenses.map((item) => item.id),
    next.expenses.map((item) => [item.id, item]),
  )

  for (let start = 0; start < operations.length; start += BATCH_SIZE) {
    const batch = writeBatch(db)
    operations.slice(start, start + BATCH_SIZE).forEach((operation) => operation(batch))
    await batch.commit()
  }
  // An imported backup always replaces the defaults, so they must not come back
  await setDoc(userDoc(db, uid), { seeded: true }, { merge: true })
}
