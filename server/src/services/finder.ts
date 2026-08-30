import { getBoardBackend } from "../controllers/board.js"
import type { Result } from "../types/Result.ts"
import type { Board } from "../types/Board.ts"
import type { Column } from "../types/Column.ts"
import type { Task } from "../types/Task.ts"

export function findBoard(userId:string, boardId: string): Result<Board> {
  const board = getBoardBackend(userId, boardId)
  if (!board) return { ok: false, error: "Board not found" }
  return { ok: true, data: board }
}

export function findColumn(userId:string, boardId: string, columnId: string): Result<Column> {

  const board = findBoard(userId, boardId)

  if (!board.ok) return board

  const column = board.data.columns.find(c => c.id === columnId)

  if (!column)
    return { ok: false, error: "Column not found" }

  return { ok: true, data: column }
}

export function findTask(userId:string, boardId: string, columnId: string, taskId: string): Result<Task> {
  const column = findColumn(userId, boardId, columnId)
  if (!column.ok) return column

  const task = column.data.tasks.find(t => t.id === taskId)

  if (!task)
    return { ok: false, error: "Task not found" }

  return { ok: true, data: task }
}

export function findColumnWithTask(userId:string, boardId: string, taskId: string): Result<Column> { 
  const board = findBoard(userId, boardId)
  if (!board.ok) return board

  for (const column of board.data.columns) {
    const task = column.tasks.find(t => t.id === taskId)
    if (task) {
      return { ok: true, data: column }
    }
  }

  return { ok: false, error: "Task not found" }
}