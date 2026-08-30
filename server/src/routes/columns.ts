import { Router } from "express"
import type { Application } from "express"
import { createColumn, readColumn, updateColumn, deleteColumn } from "../controllers/columns.js"

export function registerColumnRoutes(app: Application) {
  const router = Router()

  router.post("/users/:userId/boards/:boardId/columns", createColumn)
  router.get("/users/:userId/boards/:boardId/columns/:columnId", readColumn)
  router.patch("/users/:userId/boards/:boardId/columns/:columnId", updateColumn)
  router.delete("/users/:userId/boards/:boardId/columns/:columnId", deleteColumn)

  app.use(router)
}