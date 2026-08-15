import { Router } from "express"
import type { Application } from "express"
import { v4 as uuid } from "uuid"
import { getBoard } from "./board.js"

const ONLYBOARD = getBoard()

export function registerTasksCollectionRoutes(app: Application) { //A task Collection does not have neither a create nor a delete.
  const router = Router()
  router.get("/boards/:boardId/columns/:columnId/tasks", (req, res) => {
    const boardId = req.params.boardId

    if (ONLYBOARD.id !== boardId) {
      return res.status(404).json({
          error: "Board not found"
      })
    }
    const column = ONLYBOARD.columns.find(column => column.id === req.params.columnId)
    if (!column) {
      return res.status(404).json({
          error: "Column not found"
      })
    }
    res.json(column.tasks)
  })
  router.put("/boards/:boardId/columns/:columnId/tasks", (req, res) => {
    //placeholder for metadata
    return res.status(501).json({
      error: "Not implemented",
      message: "Column Collection update will be implemented along with board metadata (i.e. color customization)"
    })
  })

  app.use(router)
}