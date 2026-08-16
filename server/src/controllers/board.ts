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
  res.json(board) //placeholder
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