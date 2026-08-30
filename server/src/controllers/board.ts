import { Request, Response } from "express"
import type { Board } from "../types/Board.ts"
import {getUserBackend} from "./user.js"

let mockBoardDb = {
  Boards: {} as Record<string, Board>
}

export function getBoardBackend(userId: string, boardId: string): Board | number {
  const board = mockBoardDb.Boards[boardId]
  if (!board) {
    return 404
  }
  const user = getUserBackend(userId)
  if (!user) {
    return 401
  }
  const userOwnsBoard = user.boardsIds.find(possibleBoardId => boardId === possibleBoardId)
  if (!userOwnsBoard) {
    return 403
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

function nonFoundBoardErrors(userId: string, boardId: string, res: Response) {
  const boardExists = mockBoardDb.Boards[boardId]
  if (!boardExists) {
    return res.status(404).json({
      error: "Board not found",
      message: "The requested board does not exist"
    })
  } else {
    if (!getUserBackend(userId)) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "The user does not exist"
      })
    } else {
      return res.status(403).json({
        error: "Forbidden",
        message: "The user does not have permission to access the requested board"
      })
    }
  }
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
  if (typeof board === "number") {
    return nonFoundBoardErrors(userId, boardId, res)
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
   if (typeof board === "number") {
    return nonFoundBoardErrors(userId, boardId, res)
  }
  const newBoard: Board = req.body
  board.title = newBoard.title
  board.columns = newBoard.columns

  res.status(200).json(board)
}