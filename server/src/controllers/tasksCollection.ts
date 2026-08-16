import { Request, Response } from "express"
import { findColumn } from "../services/finder.js"

type Params = {
  boardId: string
  columnId: string
}

//A task Collection does not have either a create or a delete.

export function readTaskCollection(req: Request<Params>, res: Response) {
  const boardId = req.params.boardId
  const columnId = req.params.columnId
  const column = findColumn(boardId, columnId)
  if (!column.ok) {
    return res.status(404).json({
      error: column.error
    })
  }
  res.json(column.data.tasks)
}

export function updateTaskCollection(req: Request, res: Response) {
//placeholder for metadata
  return res.status(501).json({
    error: "Not implemented",
    message: "Task Collection update will be implemented along with board metadata (i.e. color customization)"
  })
}