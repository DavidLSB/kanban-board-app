import { Router } from "express"
import type { Application } from "express"
import { readColumnCollection, updateColumnCollection } from "../controllers/columnCollection.js"

export function registerCollumnCollectionRoutes(app: Application) { //A column Collection does not have neither a create nor a delete.
  const router = Router()
  
  router.get("/boards/:boardId/columns", readColumnCollection)
  router.patch("/boards/:boardId/columns", updateColumnCollection)
  
  app.use(router)
}