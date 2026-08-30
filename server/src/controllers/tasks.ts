import { Request, Response } from "express"
import { v4 as uuid } from "uuid"
import type { Task } from "../types/Task.js"
import type {TaskParams as Params} from "../types/Params.js"
import { findBoard, findColumn, findTask, findColumnWithTask } from "../services/finder.js"

export function createTask(req: Request<Params>, res: Response) {
  const userId = req.params.userId
  const boardId = req.params.boardId
  const columnId = req.params.columnId
  const column = findColumn(userId, boardId, columnId)
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
  const userId = req.params.userId
  const boardId = req.params.boardId
  const columnId = req.params.columnId
  const taskId = req.params.taskId
  const task = findTask(userId, boardId, columnId, taskId)
  if (!task.ok) {
    return res.status(404).json({
      error: task.error
    })
  }
  res.status(200).json(task.data)
}

export function updateTask(req: Request<Params>, res: Response) {
  const userId = req.params.userId
  const boardId = req.params.boardId
  const columnId = req.params.columnId
  const taskId = req.params.taskId
  const task = findTask(userId, boardId, columnId, taskId)
  if (!task.ok) {
    return res.status(404).json({
      error: task.error
    })
  }
  if (req.body.title !== undefined) task.data.title = req.body.title
  if (req.body.description !== undefined) task.data.description = req.body.description
  if (req.body.newColumnId !== undefined) {
    const currentColumn = findColumn(userId, boardId, columnId)
    if (!currentColumn.ok) {
      return res.status(404).json({
        error: currentColumn.error
      })
    }
    const newColumn = findColumn(userId, boardId, req.body.newColumnId)
    if (!newColumn.ok) {
      return res.status(404).json({
        error: newColumn.error
      })
    }
    currentColumn.data.tasks = currentColumn.data.tasks.filter(t => t.id !== taskId).map((t, index) => ({ ...t, index }))
    task.data.index = newColumn.data.tasks.length
    newColumn.data.tasks.push(task.data)
  }
  const finalColumnId = req.body.newColumnId !== undefined ? req.body.newColumnId : columnId;
  const columnToReorder = findColumn(userId, boardId, finalColumnId)
  if (!columnToReorder.ok) {
    return res.status(404).json({
      error: columnToReorder.error
    })
  }
  if (req.body.index !== undefined) {
    const targetIndex = req.body.index
    const tasks = columnToReorder.data.tasks.filter(t => t.id !== taskId)
    tasks.splice(targetIndex, 0, task.data)
    columnToReorder.data.tasks = tasks.map((t, index) => ({ ...t, index }))
  } else {
    columnToReorder.data.tasks = columnToReorder.data.tasks.map((t, index) => ({ ...t, index }))
  }
  res.status(200).json(task.data)
}

export function deleteTask(req: Request<Params>, res: Response) {
  const userId = req.params.userId
  const boardId = req.params.boardId
  const columnId = req.params.columnId
  const column = findColumn(userId, boardId, columnId)
  if (!column.ok) {
    return res.status(404).json({
      error: column.error
    })
  }
  const taskId = req.params.taskId
  const task = findTask(userId, boardId, columnId, taskId)
  if (!task.ok) {
    return res.status(404).json({
      error: task.error
    })
  }
  column.data.tasks = column.data.tasks.filter(t => t.id !== taskId).map((t, index) => ({ ...t, index })) //delete with reindex
  res.status(200).json(column.data.tasks)
}