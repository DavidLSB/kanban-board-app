import { Request, Response } from "express"
import { v4 as uuid } from "uuid"
import type {UserParams as Params} from "../types/Params.js"
import { User } from "../types/User.js"
import { createBoardBackend } from "./board.js"

let mockDb = {
  users: {} as Record<string, User>
}

export function getUserBackend(userId: string): User | null {
  const user = mockDb.users[userId]
  return user ?? null
}

export function createUser(_req: Request<Params>, res: Response) {
  const userBoardId = uuid()
  const newUser: User = {
    id: uuid(),
    boardsIds: [],
    selectedBoardId: userBoardId
  }
  mockDb.users[newUser.id] = newUser
  createBoardBackend(newUser.id, userBoardId)
  res.status(201).json(newUser)
}

export function findUser(req: Request<Params>, res: Response) {
  const userId = req.params.userId
  const user = mockDb.users[userId]
  if (!user) {
    return res.status(404).json({error: "User not found"})
  }
  res.status(200).json(user)
}