import { Router } from "express"
import type { Application } from "express"
import  { getBoardBackend as getBoardController, createBoard, readBoard, updateBoard, deleteBoard, overwriteBoard } from "../controllers/board.js"

export function getBoard(userId: string, boardId: string) {
  return getBoardController(userId, boardId)
}

export function registerBoardRoutes(app: Application) {
  const router = Router()

  //create when multiple boards are implemented, post on the user

  router.get("/users/:userId/boards/:boardId", readBoard)
  router.put("/users/:userId/boards/:boardId", updateBoard)
  router.delete("/users/:userId/boards/:boardId", deleteBoard)
  router.put("/users/:userId/boards/:boardId/overwrite", overwriteBoard) //overwrites the board with local storage data, used for conflict resolution
  app.use(router)
}