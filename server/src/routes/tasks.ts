import { Router } from "express"
import type { Application } from "express"
import { createTask, readTask, updateTask, deleteTask } from "../controllers/tasks.js"

export function registerTasksRoutes(app: Application) {
  const router = Router()

  router.post("/users/:userId/boards/:boardId/columns/:columnId/tasks", createTask)
  router.get("/users/:userId/boards/:boardId/columns/:columnId/tasks/:taskId", readTask)
  router.patch("/users/:userId/boards/:boardId/columns/:columnId/tasks/:taskId", updateTask)
  router.delete("/users/:userId/boards/:boardId/columns/:columnId/tasks/:taskId", deleteTask)

  app.use(router)
}