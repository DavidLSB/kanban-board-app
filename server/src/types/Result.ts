export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: "Board not found" | "Column not found" | "Task not found" }