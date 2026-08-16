import { getBoard } from "../controllers/board.js"
import type { Result } from "../types/Result.ts"
import type { Board } from "../types/Board.ts"
import type { Column } from "../types/Column.ts"
import type { Task } from "../types/Task.ts"


const board = getBoard()

export function findBoard(boardId: string): Result<Board> {
  if (board.id !== boardId) return { ok: false, error: "Board not found" }
  return { ok: true, data: board }
}

export function findColumn(boardId: string, columnId: string): Result<Column> {

  const board = findBoard(boardId)

  if (!board.ok) return board

  const column = board.data.columns.find(c => c.id === columnId)

  if (!column)
    return { ok: false, error: "Column not found" }

  return { ok: true, data: column }
}

export function findTask(boardId: string, columnId: string, taskId: string): Result<Task> {
  const column = findColumn(boardId, columnId)
  if (!column.ok) return column

  const task = column.data.tasks.find(t => t.id === taskId)

  if (!task)
    return { ok: false, error: "Task not found" }

  return { ok: true, data: task }
}