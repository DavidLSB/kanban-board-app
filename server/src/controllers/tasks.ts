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
    return res.status(column.errorCode).json({error: column.error})
  }
  if (!req.body.title || req.body.title.trim() === "") {
    return res.status(400).json({
      error: "Bad request",
      message: "Missing title in request body"
    })
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
    return res.status(task.errorCode).json({
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
    return res.status(task.errorCode).json({
      error: task.error
    })
  }
  const columnJump = req.body.newColumnId !== undefined 
    ? {
        currentColumn: findColumn(userId, boardId, columnId),
        newColumn: findColumn(userId, boardId, req.body.newColumnId)
      }
    : null
  if (columnJump !== null) {
    if (!columnJump.currentColumn.ok) {
      return res.status(columnJump.currentColumn.errorCode).json({
        error: `${columnJump.currentColumn.error} (Source column)`
      })
    }
    if (!columnJump.newColumn.ok) {
      return res.status(columnJump.newColumn.errorCode).json({
        error: `${columnJump.newColumn.error} (Target column)`
      })
    }
  }
  const movement = req.body.index !== undefined || req.body.newColumnId !== undefined
    ? true : false
  const columnToReorder = columnJump?.newColumn || findColumn(userId, boardId, columnId)
  if (!columnToReorder.ok) {
    return res.status(columnToReorder.errorCode).json({
      error: columnToReorder.error
    })
  }
  
  if (columnJump !== null && columnJump.currentColumn.ok && columnJump.newColumn.ok) {
    columnJump.currentColumn.data.tasks = columnJump.currentColumn.data.tasks.filter(t => t.id !== taskId).map((t, index) => ({ ...t, index }))
    task.data.index = columnJump.newColumn.data.tasks.length
    columnJump.newColumn.data.tasks.push(task.data)
  }
  if (movement) {
    if (req.body.index !== undefined) {
      const targetIndex = req.body.index
      const tasks = columnToReorder.data.tasks.filter(t => t.id !== taskId)
      tasks.splice(targetIndex, 0, task.data)
      columnToReorder.data.tasks = tasks.map((t, index) => ({ ...t, index }))
    } else {
      columnToReorder.data.tasks = columnToReorder.data.tasks.map((t, index) => ({ ...t, index }))
    }
  }
  if (req.body.title !== undefined) task.data.title = req.body.title
  if (req.body.description !== undefined) task.data.description = req.body.description
  res.status(200).json(task.data)
}

export function deleteTask(req: Request<Params>, res: Response) {
  const userId = req.params.userId
  const boardId = req.params.boardId
  const columnId = req.params.columnId
  const column = findColumn(userId, boardId, columnId)
  if (!column.ok) {
    return res.status(column.errorCode).json({
      error: column.error
    })
  }
  const taskId = req.params.taskId
  const task = findTask(userId, boardId, columnId, taskId)
  if (!task.ok) {
    return res.status(task.errorCode).json({
      error: task.error
    })
  }
  column.data.tasks = column.data.tasks.filter(t => t.id !== taskId).map((t, index) => ({ ...t, index })) //delete with reindex
  res.status(200).json(column.data.tasks)
}