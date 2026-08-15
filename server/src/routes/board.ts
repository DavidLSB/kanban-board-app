import { Router } from "express"
import type { Application } from "express"
import type { Board } from "../types/Board.ts"

const board: Board = { //temporarely, a board's Create method is a constant. In the future it should be its own post method to allow multiple boards
    id: "1", //replace with uuid() eventually
    title: "My board",
    columns: []
}

export function getBoard() {
  return board
}

export function registerBoardRoutes(app: Application) {
  const router = Router()

  //create when multiple boards are implemented

  router.get("/boards", (req, res) => {
    res.json(board)
  })
  
  router.put("/boards", (req, res) => {
    //placeholder for metadata
    return res.status(501).json({
      error: "Not implemented",
      message: "Board update will be implemented along with board metadata (i.e. color customization)"
    })
  })
  router.delete("/boards", (req, res) => {
    //placeholder for multiple boards
    return res.status(501).json({
      error: "Not implemented",
      message: "Board deletion will be implemented along with multiple boards"
    })
  })

  app.use(router)
}