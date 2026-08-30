import { Request, Response } from "express"
import { findBoard } from "../services/finder.js"
import {getBoardBackend} from "./board.js"
import type {TaskParams as Params} from "../types/Params.js"

//A column Collection does not have either a create or a delete.

export function readColumnCollection(req: Request<Params>, res: Response) {
  const userId = req.params.userId
  const boardId = req.params.boardId
  const board = findBoard(userId, boardId)
  if (!board.ok) {
    return res.status(board.errorCode).json({
      error: board.error
    })
  }
  res.status(200).json(board.data.columns)
}

export function updateColumnCollection(req: Request, res: Response) {
  //placeholder for metadata
  return res.status(501).json({
    error: "Not implemented",
    message: "Column Collection update will be implemented along with board metadata (i.e. color customization)"
  })
}