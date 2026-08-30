import { Request, Response } from "express"
import { v4 as uuid } from "uuid"
import type { Column } from "../types/Column.ts"
import type {ColumnParams as Params} from "../types/Params.js"
import { findBoard, findColumn } from "../services/finder.js"

export function createColumn(req: Request<Params>, res: Response) {
  const userId = req.params.userId
  const boardId = req.params.boardId
  const board = findBoard(userId, boardId)
  if (!board.ok)
    return res.status(board.errorCode).json({
      error: board.error
    })
  if (!req.body.title) {
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a title for the new column"
    })
  }
  if (typeof req.body.title !== "string" || req.body.title.trim() === "") {
    return res.status(400).json({
      error: "Bad Request",
      message: "The title must be a non-empty string"
    })
  }
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
  const userId = req.params.userId
  const boardId = req.params.boardId
  const columnId = req.params.columnId
  const column = findColumn(userId, boardId, columnId)
  if (!column.ok) {
    return res.status(column.errorCode).json({error: column.error})
  }
  res.status(200).json(column.data)
}

export function updateColumn(req: Request<Params>, res: Response) {
  if (!req.body.title && req.body.index === undefined) {
    return res.status(400).json({
      error: "Bad Request",
      message: "The request body must contain a title or index to update the column"
    })
  }
  const userId = req.params.userId
  const boardId = req.params.boardId
  const columnId = req.params.columnId
  const column = findColumn(userId, boardId, columnId)
  if (!column.ok) {
    return res.status(column.errorCode).json({ error: column.error })
  }
  const board = findBoard(userId, boardId)
  if (!board.ok) {
    return res.status(board.errorCode).json({ error: board.error })
  }
  if (req.body.title !== undefined) column.data.title = req.body.title
  if (req.body.index !== undefined) column.data.index = req.body.index
  if (req.body.index !== undefined) {
    const columns = board.data.columns.filter(c => c.id !== columnId)
    columns.splice(req.body.index, 0, column.data)
    board.data.columns = columns.map((c, index) => ({ ...c, index }))
  }
  res.status(200).json(column.data)
}

export function deleteColumn(req: Request<Params>, res: Response) {
  const userId = req.params.userId
  const boardId = req.params.boardId
  const board = findBoard(userId, boardId)
  if (!board.ok) {
    return res.status(board.errorCode).json({
      error: board.error
    })
  }
  const columnId = req.params.columnId
  const column = findColumn(userId, boardId, columnId)
  if (!column.ok) {
    return res.status(column.errorCode).json({
      error: column.error
    })
  }
  board.data.columns = board.data.columns.filter(c => c.id !== req.params.columnId).map((c, index) => ({ ...c, index })) //delete with reindex
  res.status(200).json(board.data.columns)
}