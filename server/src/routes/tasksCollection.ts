import { Router } from "express"
import type { Application } from "express"
import { readTaskCollection, updateTaskCollection } from "../controllers/tasksCollection.js"

export function registerTasksCollectionRoutes(app: Application) { //A task Collection does not have neither a create nor a delete.
  const router = Router()
  
  router.get("/boards/:boardId/columns/:columnId/tasks", readTaskCollection)
  router.patch("/boards/:boardId/columns/:columnId/tasks", updateTaskCollection)

  app.use(router)
}