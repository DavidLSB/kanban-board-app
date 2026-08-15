import { Router } from "express"
import type { Application } from "express"
import { v4 as uuid } from "uuid"
import { getBoard } from "./board.js"

const ONLYBOARD = getBoard()

export function registerCollumnCollectionRoutes(app: Application) { //A collumn Collection does not have neither a create nor a delete.
  const router = Router()
  router.get("/boards/:boardId/columns", (req, res) => {
    const boardId = req.params.boardId

    if (ONLYBOARD.id !== boardId) {
      return res.status(404).json({
          error: "Board not found"
      })
    }
    res.json(ONLYBOARD.columns)
  })
  router.put("/boards/:boardId/columns", (req, res) => {
    //placeholder for metadata
    return res.status(501).json({
      error: "Not implemented",
      message: "Column Collection update will be implemented along with board metadata (i.e. color customization)"
    })
  })

  app.use(router)
}