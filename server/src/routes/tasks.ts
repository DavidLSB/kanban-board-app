import { Router } from "express"
import type { Application } from "express"
import { v4 as uuid } from "uuid"
import { getBoard } from "./board.js"
import type { Task } from "../types/Task.js"

const ONLYBOARD = getBoard()

export function registerTasksRoutes(app: Application) {
  const router = Router()
  router.post("/boards/:boardId/columns/:columnId/tasks", (req, res) => {
    const boardId = req.params.boardId

    if (ONLYBOARD.id !== boardId)
        return res.status(404).json({error:"Board not found"})
    const column = ONLYBOARD.columns.find(column => column.id === req.params.columnId)
    if (!column) {
      return res.status(404).json({error:"Column not found"})
    }
    const newTask: Task = {
        id: uuid(),
        title: req.body.title,
        description: req.body.description,
        index: column.tasks.length,
    }

    column.tasks.push(newTask)

    res.status(201).json(newTask)
  })
  router.get("/boards/:boardId/columns/:columnId/tasks/:taskId", (req, res) => {
    const boardId = req.params.boardId

    if (ONLYBOARD.id !== boardId) {
      return res.status(404).json({
          error: "Board not found"
      })
    }
    const column = ONLYBOARD.columns.find(column => column.id === req.params.columnId)
    if (!column) {
      return res.status(404).json({
          error: "Column not found"
      })
    }
    const task = column.tasks.find(task => task.id === req.params.taskId)
    if (!task) {
      return res.status(404).json({
          error: "Task not found"
      })
    }
    res.json(task)
  })

  router.put("/boards/:boardId/columns/:columnId/tasks/:taskId", (req, res) => {
    const boardId = req.params.boardId

    if (ONLYBOARD.id !== boardId) {
      return res.status(404).json({
          error: "Board not found"
      })
    }
    const column = ONLYBOARD.columns.find(column => column.id === req.params.columnId)
    if (!column) {
      return res.status(404).json({
          error: "Column not found"
      })
    }
    const task = column.tasks.find(task => task.id === req.params.taskId)
    if (!task) {
      return res.status(404).json({
          error: "Task not found"
      })
    }
    task.title = req.body.title
    task.description = req.body.description
    res.json(task)
  })

  router.delete("/boards/:boardId/columns/:columnId/tasks/:taskId", (req, res) => {
    const boardId = req.params.boardId

    if (ONLYBOARD.id !== boardId) {
      return res.status(404).json({
          error: "Board not found"
      })
    }
    const column = ONLYBOARD.columns.find(column => column.id === req.params.columnId)
    if (!column) {
      return res.status(404).json({
          error: "Column not found"
      })
    }
    const task = column.tasks.find(task => task.id === req.params.taskId)
    if (!task) {
      return res.status(404).json({
          error: "Task not found"
      })
    }
    column.tasks = column.tasks.filter(t => t.id !== req.params.taskId).map((t, index) => ({ ...t, index })) //delete with reindex
    res.json(column.tasks)
  })

  app.use(router)
}