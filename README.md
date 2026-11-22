# MIS 233 — Assignment 3: Task Manager with a Reducer

- **Name:** Muhammet Furkan Yılmaz
- **Student Number:** 2024502108

---

Bonus 1: Undo

The reducer state was extended to `type State = { tasks: Task[]; filter: Filter; past: Task[][] }`, where `past` acts as an immutable stack of previous `Task[]` snapshots. Whenever a task-mutating action (`add`, `advance`, `remove`, or `clearDone`) changes `tasks`, the prior `state.tasks` array is pushed onto `past`, whereas `setFilter` leaves `past` untouched so filter navigation is not undoable. Dispatching `{ type: 'undo' }` pops the most recent task list from `past` back into `tasks`, and the Undo button stays disabled whenever `past` is empty.

---

Bonus 2: Tests

All 10 unit tests covering `taskReducer`, state immutability (`Object.freeze`), edge cases, `filterTasks`, and `countByFilter` pass via `npm test`:

```text
> task-manager-assignment3@0.0.0 test
> vitest run

 ✓ src/taskReducer.test.ts (10 tests) 3ms
   ✓ taskReducer (8)
     ✓ adds a task with status todo 2ms
     ✓ advances a task through all statuses and cycles back to todo 0ms
     ✓ removes a task by id 0ms
     ✓ updates filter without modifying tasks or adding to undo history 0ms
     ✓ clears only done tasks and keeps the current filter 0ms
     ✓ undoes task changes including clearDone, and does nothing when past is empty 0ms
     ✓ does not mutate the previous state (verified with Object.freeze) 0ms
     ✓ handles edge cases: unknown id, empty list, and clearDone with no done tasks 0ms
   ✓ filterTasks and countByFilter (2)
     ✓ filters tasks accurately for all filter values 0ms
     ✓ computes accurate counts initially, on empty list, and after deletion 0ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
```

---

Bonus 3: Explain your reducer

A reducer must be a pure function because React relies on reference equality (`Object.is`) to detect state updates and re-render components. If a reducer mutates the existing state object or array in place and returns the same reference, React assumes nothing changed and skips re-rendering the UI. Mutation also corrupts undo history and breaks React Strict Mode, which invokes reducers twice during development to expose unintended side effects.

Generating IDs inside the caller (such as `AddForm`) rather than inside the reducer preserves purity and determinism. Given the exact same `(state, action)` arguments, a pure reducer must always produce the exact same next state. Calling `crypto.randomUUID()` or `Date.now()` inside the reducer would make its output unpredictable and harder to test reliably.

The filtered task list and status counts are computed during render as derived state instead of being stored inside the reducer state. Storing `filteredTasks` or `counts` separately creates duplicate sources of truth that easily go out of sync—for example, deleting or advancing a task could update `tasks` while leaving `counts` or the visible list stale if one branch forgets to recalculate them.

Moving `filter` into the reducer state made state transitions cleaner and easier to reason about because every user interaction flows through a single `dispatch` pipeline and one central `switch` statement, rather than coordinating multiple `useState` hooks across components.

---

Bonus 4: Git repository

https://github.com/mrfurkanyilzm-code/mis233-assignment3