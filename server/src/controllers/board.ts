import { Request, Response } from "express"
import type { Board } from "../types/Board.ts"

const board: Board = { //temporarely, a board's Create method is a constant. In the future it should be its own post method to allow multiple boards
  id: "1", //replace with uuid() eventually
  title: "My board",
  columns: []
}

export function getBoard() {
  return board
}

export function createBoard(req: Request, res: Response) {
  res.json(board) //placeholder, should use user related logic to post a board
}

export function readBoard(req: Request, res: Response) {
  res.status(200).json(board)
}

export function updateBoard(req: Request, res: Response) {
  //placeholder for metadata
  return res.status(501).json({
    error: "Not implemented",
    message: "Board update will be implemented along with board metadata (i.e. color customization)"
  })
}

export function deleteBoard(req: Request, res: Response) {
  //placeholder for metadata
  return res.status(501).json({
    error: "Not implemented",
    message: "Board deletion will be implemented along with multiple boards"
  })
}

export function overwriteBoard(req: Request, res: Response) {
  const newBoard: Board = req.body
  if (!newBoard || !newBoard.columns) {
    return res.status(400).json({
      error: "Invalid board data",
      message: "The request body must contain a valid board object with columns"
    })
  }
  // Overwrite the existing board with the new data
  board.title = newBoard.title
  board.columns = newBoard.columns

  res.status(200).json(board)
}