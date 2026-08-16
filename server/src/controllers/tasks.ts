import { Request, Response } from "express"
import { v4 as uuid } from "uuid"
import type { Task } from "../types/Task.js"
import { findBoard, findColumn, findTask } from "../services/finder.js"

type Params = {
  boardId: string
  columnId: string
  taskId: string
}

export function createTask(req: Request<Params>, res: Response) {
  const boardId = req.params.boardId
  const columnId = req.params.columnId
  const column = findColumn(boardId, columnId)
  if (!column.ok) {
    return res.status(404).json({error: column.error})
  }
  const newTask: Task = {
    id: uuid(),
    title: req.body.title,
    description: req.body.description,
    index: column.data.tasks.length,
  }

  column.data.tasks.push(newTask)

  res.status(201).json(newTask)
}

export function readTask(req: Request<Params>, res: Response) {
  const boardId = req.params.boardId
  const columnId = req.params.columnId
  const taskId = req.params.taskId
  const task = findTask(boardId, columnId, taskId)
  if (!task.ok) {
    return res.status(404).json({
      error: task.error
    })
  }
  res.json(task.data)
}

export function updateTask(req: Request<Params>, res: Response) {
  const boardId = req.params.boardId
  const columnId = req.params.columnId
  const taskId = req.params.taskId
  const task = findTask(boardId, columnId, taskId)
  if (!task.ok) {
    return res.status(404).json({
      error: task.error
    })
  }
  task.data.title = req.body.title
  task.data.description = req.body.description
  res.json(task.data)
}

export function deleteTask(req: Request<Params>, res: Response) {
  const boardId = req.params.boardId
  const columnId = req.params.columnId
  const column = findColumn(boardId, columnId)
  if (!column.ok) {
    return res.status(404).json({
      error: column.error
    })
  }
  const taskId = req.params.taskId
  const task = findTask(boardId, columnId, taskId)
  if (!task.ok) {
    return res.status(404).json({
      error: task.error
    })
  }
  column.data.tasks = column.data.tasks.filter(t => t.id !== taskId).map((t, index) => ({ ...t, index })) //delete with reindex
  res.json(column.data.tasks)
}