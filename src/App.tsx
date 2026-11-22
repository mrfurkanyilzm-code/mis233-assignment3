import { useReducer, type Dispatch } from 'react'
import { taskReducer, initialState, type Task, type Action } from './taskReducer'
import { FILTERS, filterTasks, countByFilter, type Filter } from './filter'
import TaskRow from './TaskRow'

const FILTER_LABELS: Record<Filter, string> = {
  all: 'All',
  todo: 'To do',
  'in-progress': 'In progress',
  done: 'Done',
}

function AddForm({ dispatch }: { dispatch: Dispatch<Action> }) {
  function addTask(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim()
    if (title) dispatch({ type: 'add', id: crypto.randomUUID(), title })
  }
  return (
    <form action={addTask} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      <input name="title" placeholder="New task" style={{ flex: 1, padding: '6px 8px' }} />
      <button type="submit">Add</button>
    </form>
  )
}

function FilterBar({
  activeFilter,
  counts,
  canUndo,
  dispatch,
}: {
  activeFilter: Filter
  counts: Record<Filter, number>
  canUndo: boolean
  dispatch: Dispatch<Action>
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
      {FILTERS.map((f) => {
        const isActive = f === activeFilter
        return (
          <button
            key={f}
            type="button"
            aria-pressed={isActive}
            onClick={() => dispatch({ type: 'setFilter', filter: f })}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #ccc',
              cursor: 'pointer',
              fontWeight: isActive ? 700 : 400,
              backgroundColor: isActive ? '#1f2937' : '#f9fafb',
              color: isActive ? '#ffffff' : '#111827',
            }}
          >
            {FILTER_LABELS[f]} ({counts[f]})
          </button>
        )
      })}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
        <button
          type="button"
          disabled={!canUndo}
          onClick={() => dispatch({ type: 'undo' })}
          style={{ padding: '6px 12px', cursor: canUndo ? 'pointer' : 'not-allowed' }}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'clearDone' })}
          style={{ padding: '6px 12px', cursor: 'pointer' }}
        >
          Clear done
        </button>
      </div>
    </div>
  )
}

function TaskList({ tasks, dispatch }: { tasks: Task[]; dispatch: Dispatch<Action> }) {
  if (tasks.length === 0) {
    return <p style={{ color: '#6b7280' }}>No tasks here.</p>
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {tasks.map((t) => (
        <TaskRow
          key={t.id}
          task={t}
          onNext={() => dispatch({ type: 'advance', id: t.id })}
          onDelete={() => dispatch({ type: 'remove', id: t.id })}
        />
      ))}
    </ul>
  )
}

export default function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  const visibleTasks = filterTasks(state.tasks, state.filter)
  const counts = countByFilter(state.tasks)

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Task Manager</h1>
      <AddForm dispatch={dispatch} />
      <FilterBar
        activeFilter={state.filter}
        counts={counts}
        canUndo={state.past.length > 0}
        dispatch={dispatch}
      />
      <TaskList tasks={visibleTasks} dispatch={dispatch} />
    </main>
  )
}