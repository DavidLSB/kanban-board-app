import { Request, Response } from "express"
import { findColumn } from "../services/finder.js"
import type {ColumnParams as Params} from "../types/Params.js"


//A task Collection does not have either a create or a delete.

export function readTaskCollection(req: Request<Params>, res: Response) {
  const userId = req.params.userId
  const boardId = req.params.boardId
  const columnId = req.params.columnId
  const column = findColumn(userId, boardId, columnId)
  if (!column.ok) {
    return res.status(column.errorCode).json({
      error: column.error
    })
  }
  res.json(column.data.tasks)
  res.status(200)
}

export function updateTaskCollection(req: Request, res: Response) {
//placeholder for metadata
  return res.status(501).json({
    error: "Not implemented",
    message: "Task Collection update will be implemented along with board metadata (i.e. color customization)"
  })
}