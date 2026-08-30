import { Router } from "express"
import type { Application } from "express"
import { readColumnCollection, updateColumnCollection } from "../controllers/columnCollection.js"

export function registerCollumnCollectionRoutes(app: Application) { //A column Collection does not have neither a create nor a delete.
  const router = Router()
  
  router.get("/users/:userId/boards/:boardId/columns", readColumnCollection)
  router.patch("/users/:userId/boards/:boardId/columns", updateColumnCollection)
  
  app.use(router)
}