import { describe, it, expect } from 'vitest'
import { taskReducer, initialState, type State, type Task } from './taskReducer'
import { filterTasks, countByFilter } from './filter'

describe('taskReducer', () => {
  it('adds a task with status todo', () => {
    const next = taskReducer(initialState, { type: 'add', id: '1', title: 'Study MIS 233' })
    expect(next.tasks).toEqual([{ id: '1', title: 'Study MIS 233', status: 'todo' }])
    expect(next.filter).toBe('all')
    expect(next.past).toHaveLength(1)
  })

  it('advances a task through all statuses and cycles back to todo', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    expect(state.tasks[0].status).toBe('todo')

    state = taskReducer(state, { type: 'advance', id: '1' })
    expect(state.tasks[0].status).toBe('in-progress')

    state = taskReducer(state, { type: 'advance', id: '1' })
    expect(state.tasks[0].status).toBe('done')

    state = taskReducer(state, { type: 'advance', id: '1' })
    expect(state.tasks[0].status).toBe('todo')
  })

  it('removes a task by id', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    state = taskReducer(state, { type: 'add', id: '2', title: 'Task 2' })
    state = taskReducer(state, { type: 'remove', id: '1' })

    expect(state.tasks).toEqual([{ id: '2', title: 'Task 2', status: 'todo' }])
  })

  it('updates filter without modifying tasks or adding to undo history', () => {
    const s1 = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    const s2 = taskReducer(s1, { type: 'setFilter', filter: 'done' })

    expect(s2.filter).toBe('done')
    expect(s2.tasks).toEqual(s1.tasks)
    expect(s2.past).toHaveLength(s1.past.length)
  })

  it('clears only done tasks and keeps the current filter', () => {
    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    state = taskReducer(state, { type: 'add', id: '2', title: 'Task 2' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    state = taskReducer(state, { type: 'advance', id: '1' }) // id '1' is now 'done'
    state = taskReducer(state, { type: 'setFilter', filter: 'in-progress' })

    const cleared = taskReducer(state, { type: 'clearDone' })
    expect(cleared.tasks).toEqual([{ id: '2', title: 'Task 2', status: 'todo' }])
    expect(cleared.filter).toBe('in-progress')
  })

  it('undoes task changes including clearDone, and does nothing when past is empty', () => {
    expect(taskReducer(initialState, { type: 'undo' })).toEqual(initialState)

    let state = taskReducer(initialState, { type: 'add', id: '1', title: 'Task 1' })
    state = taskReducer(state, { type: 'advance', id: '1' })
    state = taskReducer(state, { type: 'advance', id: '1' }) // done
    state = taskReducer(state, { type: 'clearDone' })
    expect(state.tasks).toHaveLength(0)

    state = taskReducer(state, { type: 'undo' })
    expect(state.tasks).toEqual([{ id: '1', title: 'Task 1', status: 'done' }])
  })

  it('does not mutate the previous state (verified with Object.freeze)', () => {
    const frozenTask: Task = Object.freeze({ id: '1', title: 'Frozen Task', status: 'todo' })
    const frozenState: State = Object.freeze({
      tasks: Object.freeze([frozenTask]) as Task[],
      filter: 'all',
      past: Object.freeze([] as Task[][]) as Task[][],
    })

    const next = taskReducer(frozenState, { type: 'advance', id: '1' })
    expect(next).not.toBe(frozenState)
    expect(frozenState.tasks[0].status).toBe('todo')
    expect(next.tasks[0].status).toBe('in-progress')
  })

  it('handles edge cases: unknown id, empty list, and clearDone with no done tasks', () => {
    const afterUnknownAdvance = taskReducer(initialState, { type: 'advance', id: 'missing' })
    expect(afterUnknownAdvance).toBe(initialState)

    const afterUnknownRemove = taskReducer(initialState, { type: 'remove', id: 'missing' })
    expect(afterUnknownRemove).toBe(initialState)

    const withTodo = taskReducer(initialState, { type: 'add', id: '1', title: 'Still todo' })
    const afterNoOpClear = taskReducer(withTodo, { type: 'clearDone' })
    expect(afterNoOpClear).toBe(withTodo)
  })
})

describe('filterTasks and countByFilter', () => {
  const sampleTasks: Task[] = [
    { id: '1', title: 'A', status: 'todo' },
    { id: '2', title: 'B', status: 'in-progress' },
    { id: '3', title: 'C', status: 'done' },
    { id: '4', title: 'D', status: 'todo' },
  ]

  it('filters tasks accurately for all filter values', () => {
    expect(filterTasks(sampleTasks, 'all')).toHaveLength(4)
    expect(filterTasks(sampleTasks, 'todo').map((t) => t.id)).toEqual(['1', '4'])
    expect(filterTasks(sampleTasks, 'in-progress').map((t) => t.id)).toEqual(['2'])
    expect(filterTasks(sampleTasks, 'done').map((t) => t.id)).toEqual(['3'])
    expect(filterTasks([], 'todo')).toEqual([])
  })

  it('computes accurate counts initially, on empty list, and after deletion', () => {
    expect(countByFilter([])).toEqual({ all: 0, todo: 0, 'in-progress': 0, done: 0 })
    expect(countByFilter(sampleTasks)).toEqual({ all: 4, todo: 2, 'in-progress': 1, done: 1 })

    const afterDelete = sampleTasks.filter((t) => t.id !== '1')
    expect(countByFilter(afterDelete)).toEqual({ all: 3, todo: 1, 'in-progress': 1, done: 1 })
  })
})