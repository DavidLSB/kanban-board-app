export type UserParams = {
  userId: string
}

export type BoardParams = {
  userId: string
  boardId: string
}

export type ColumnParams = {
  userId: string
  boardId: string
  columnId: string
  index: string
}

export type TaskParams = {
  userId: string
  boardId: string
  columnId: string
  taskId: string
  index: string
}