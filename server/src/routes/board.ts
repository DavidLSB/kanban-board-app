import { Router } from "express"
import type { Application } from "express"
import  { getBoard as getBoardController, createBoard, readBoard, updateBoard, deleteBoard } from "../controllers/board.js"

export function getBoard() {
  return getBoardController()
}

export function registerBoardRoutes(app: Application) {
  const router = Router()

  //create when multiple boards are implemented, post on the user

  router.get("/boards", readBoard)
  router.put("/boards", updateBoard)
  router.delete("/boards", deleteBoard)

  app.use(router)
}