import { Router } from "express"
import type { Application } from "express"
import { v4 as uuid } from "uuid"
import { getBoard } from "./board.js"
import type { Column } from "../types/Column.ts"

const ONLYBOARD = getBoard()

export function registerColumnRoutes(app: Application) {
  const router = Router()
  router.post("/boards/:boardId/columns", (req, res) => {
    const boardId = req.params.boardId

    if (ONLYBOARD.id !== boardId)
        return res.status(404).json({error:"Board not found"})

    const newColumn: Column = {
        id: uuid(),
        title: req.body.title,
        index: ONLYBOARD.columns.length,
        tasks: []
    }

    ONLYBOARD.columns.push(newColumn)

    res.status(201).json(newColumn)
  })
  router.get("/boards/:boardId/columns/:columnId", (req, res) => {
    const boardId = req.params.boardId

    if (ONLYBOARD.id !== boardId) {
      return res.status(404).json({
          error: "Board not found"
      })
    }
    if (!ONLYBOARD.columns.find(column => column.id === req.params.columnId)) {
      return res.status(404).json({
          error: "Column not found"
      })
    }
    res.json(ONLYBOARD.columns.find(column => column.id === req.params.columnId))
  })

  router.put("/boards/:boardId/columns/:columnId", (req, res) => {
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
    column.title = req.body.title
    res.json(column)
  })

  router.delete("/boards/:boardId/columns/:columnId", (req, res) => {
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
    ONLYBOARD.columns = ONLYBOARD.columns.filter(c => c.id !== req.params.columnId).map((c, index) => ({ ...c, index })) //delete with reindex
    res.json(ONLYBOARD.columns)
  })

  app.use(router)
}