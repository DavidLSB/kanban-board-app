import { Request, Response } from "express"
import { v4 as uuid } from "uuid"
import type { Column } from "../types/Column.ts"
import { findBoard, findColumn } from "../services/finder.js"

type Params = {
  boardId: string
  columnId: string
}

export function createColumn(req: Request<Params>, res: Response) {
  const boardId = req.params.boardId
  const board = findBoard(boardId)
  if (!board.ok)
    return res.status(404).json({
      error: board.error
    })
  const newColumn: Column = {
    id: uuid(),
    title: req.body.title,
    index: board.data.columns.length,
    tasks: []
  }

  board.data.columns.push(newColumn)
  res.status(201).json(newColumn)
}

export function readColumn(req: Request<Params>, res: Response) {
  const boardId = req.params.boardId
  const columnId = req.params.columnId
  const column = findColumn(boardId, columnId)
  if (!column.ok) {
    return res.status(404).json({error: column.error})
  }
  res.json(column.data)
}

export function updateColumn(req: Request<Params>, res: Response) {
  const boardId = req.params.boardId
  const columnId = req.params.columnId
  const column = findColumn(boardId, columnId)
  if (!column.ok) {
    return res.status(404).json({ error: column.error })
  }
  column.data.title = req.body.title
  res.json(column.data)
}

export function deleteColumn(req: Request<Params>, res: Response) {
  const boardId = req.params.boardId
  const board = findBoard(boardId)
  if (!board.ok) {
    return res.status(404).json({
      error: board.error
    })
  }
  const columnId = req.params.columnId
  const column = findColumn(boardId, columnId)
  if (!column.ok) {
    return res.status(404).json({
      error: column.error
    })
  }
  board.data.columns = board.data.columns.filter(c => c.id !== req.params.columnId).map((c, index) => ({ ...c, index })) //delete with reindex
  res.json(board.data.columns)
}