import { Request, Response } from "express"
import { findBoard } from "../services/finder.js"
import type {TaskParams as Params} from "../types/Params.js"

//A column Collection does not have either a create or a delete.

export function readColumnCollection(req: Request<Params>, res: Response) {
  const boardId = req.params.boardId
  const board = findBoard(boardId)
  if (!board.ok) {
    return res.status(404).json({
      error: board.error
    })
  }
  res.json(board.data.columns)
}

export function updateColumnCollection(req: Request, res: Response) {
  //placeholder for metadata
  return res.status(501).json({
    error: "Not implemented",
    message: "Column Collection update will be implemented along with board metadata (i.e. color customization)"
  })
}