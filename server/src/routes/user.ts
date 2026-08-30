import { Router } from "express"
import type { Application } from "express"
import  { createUser, findUser } from "../controllers/user.js"

export function registerUserRoutes(app: Application) {
  const router = Router()

  router.post("/users", createUser)
  router.get("/users/:userId", findUser)
  
  app.use(router)
}