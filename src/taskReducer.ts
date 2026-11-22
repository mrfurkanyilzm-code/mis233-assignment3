// Muhammet Furkan Yılmaz - 2024502108
import type { Filter } from './filter'

export type Status = 'todo' | 'in-progress' | 'done'
export type Task = { id: string; title: string; status: Status }

export type State = {
  tasks: Task[]
  filter: Filter
  past: Task[][]
}

export type Action =
  | { type: 'add'; id: string; title: string }
  | { type: 'advance'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }
  | { type: 'undo' }

export const initialState: State = {
  tasks: [],
  filter: 'all',
  past: [],
}

const NEXT: Record<Status, Status> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
}

export function taskReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        tasks: [...state.tasks, { id: action.id, title: action.title, status: 'todo' }],
        past: [...state.past, state.tasks],
      }
    case 'advance': {
      if (!state.tasks.some((t) => t.id === action.id)) return state
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.id ? { ...t, status: NEXT[t.status] } : t,
        ),
        past: [...state.past, state.tasks],
      }
    }
    case 'remove': {
      const nextTasks = state.tasks.filter((t) => t.id !== action.id)
      if (nextTasks.length === state.tasks.length) return state
      return {
        ...state,
        tasks: nextTasks,
        past: [...state.past, state.tasks],
      }
    }
    case 'setFilter':
      return {
        ...state,
        filter: action.filter,
      }
    case 'clearDone': {
      const nextTasks = state.tasks.filter((t) => t.status !== 'done')
      if (nextTasks.length === state.tasks.length) return state
      return {
        ...state,
        tasks: nextTasks,
        past: [...state.past, state.tasks],
      }
    }
    case 'undo': {
      if (state.past.length === 0) return state
      const previousTasks = state.past[state.past.length - 1]
      return {
        ...state,
        tasks: previousTasks,
        past: state.past.slice(0, -1),
      }
    }
  }
}