import { Router } from "express"
import type { Application } from "express"
import { createTask, readTask, updateTask, deleteTask } from "../controllers/tasks.js"

export function registerTasksRoutes(app: Application) {
  const router = Router()

  router.post("/boards/:boardId/columns/:columnId/tasks", createTask)
  router.get("/boards/:boardId/columns/:columnId/tasks/:taskId", readTask)
  router.patch("/boards/:boardId/columns/:columnId/tasks/:taskId", updateTask)
  router.delete("/boards/:boardId/columns/:columnId/tasks/:taskId", deleteTask)

  app.use(router)
}