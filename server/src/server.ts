import express from "express"
import cors from "cors"
import { v4 as uuid } from "uuid"
import type { Column } from "./types/Column.ts"
import type { Board } from "./types/Board.ts"


const app = express()

const board: Board = {
    id: "1", //replace with uuid() eventually
    title: "My board",
    columns: []
}

const ONLYBOARD = board //for necesary replacement when multiple boards are implemented

app.use(cors())
app.use(express.json())

app.get("/boards", (req, res) => {
  res.json(ONLYBOARD)
})

app.get("/boards/:boardId/columns", (req, res) => {
  const boardId = req.params.boardId

  if (ONLYBOARD.id !== boardId) {
    return res.status(404).json({
        error: "Board not found"
    })
  }
  res.json(ONLYBOARD.columns)
})

app.put("/boards/:boardId/columns", (req, res) => {
  //placeholder for visual settings
})

app.post("/boards/:boardId/columns", (req, res) => {

    const boardId = req.params.boardId

    if (ONLYBOARD.id !== boardId)
        return res.status(404).json({error:"Board not found"})

    const newColumn: Column = {
        id: uuid(),
        title: req.body.title,
        index: ONLYBOARD.columns.length,
        tasks: []
    }

    board.columns.push(newColumn)

    res.status(201).json(newColumn)
})

app.get("/boards/:boardId/columns/:columnId", (req, res) => {
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

app.put("/boards/:boardId/columns/:columnId", (req, res) => {
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

app.delete("/boards/:boardId/columns/:columnId", (req, res) => {
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
  ONLYBOARD.columns = ONLYBOARD.columns.filter(c => c.id !== req.params.columnId)
  res.json(ONLYBOARD.columns)
})

app.listen(3001, () => {
  console.log("server running on port 3001")
})