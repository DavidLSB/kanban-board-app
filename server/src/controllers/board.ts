import { Request, Response } from "express"
import type { Board } from "../types/Board.ts"
import {getUserBackend} from "./user.js"

let mockBoardDb = {
  Boards: {} as Record<string, Board>
}

export function getBoardBackend(userId: string, boardId: string): Board | null {
  const user = getUserBackend(userId)
  const userOwnsBoard = user.boardsIds.find(possibleBoardId => boardId === possibleBoardId)
  if (!userOwnsBoard) {
    return null
  }
  const board = mockBoardDb.Boards[boardId]
  if (!board) {
    return null
  }
  return board
}

export function createBoardBackend(userId: string, boardId: string): Board | null {
  const user = getUserBackend(userId)
  if (!user) {
    throw new Error("User not found")
  }

  const newBoard: Board = {
    id: boardId,
    title: "My Board",
    columns: []
  }

  mockBoardDb.Boards[boardId] = newBoard
  user.boardsIds.push(boardId)

  return newBoard
}

export function createBoard(req: Request, res: Response) {
  return res.status(501).json({
    error: "Not implemented",
    message: "Board creation will be implemented along with multiple boards"
  })
}

export function readBoard(req: Request, res: Response) {
  const userId = req.params.userId
  const boardId = req.params.boardId
  if (typeof userId !== "string" || typeof boardId !== "string") {
    return res.status(400).json({
      error: "Invalid board request", 
      message: "The request is missing a valid userId or boardId"
    })
  }

  const board = getBoardBackend(userId, boardId)
  if (!board) {
    return res.status(404).json({
      error: "Board not found",
      message: "The requested board does not exist or the user does not have access to it"
    })
  }
  return res.status(200).json(board)
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
  const userId = req.params.userId
  const boardId = req.params.boardId
  if (typeof userId !== "string" || typeof boardId !== "string") {
    return res.status(400).json({
      error: "Invalid board request", 
      message: "The request is missing a valid userId or boardId"
    })
  }

  const board = getBoardBackend(userId, boardId)
  if (!board) {
    return res.status(404).json({
      error: "Board not found",
      message: "The requested board does not exist or the user does not have access to it"
    })
  }
  const newBoard: Board = req.body
  board.title = newBoard.title
  board.columns = newBoard.columns

  res.status(200).json(board)
}