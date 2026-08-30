export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: "Board not found" | "User not found" | "User not authorized" | "Column not found" | "Task not found"; errorCode: number }