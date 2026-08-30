import type { Board } from "./Board.ts"

export interface User {
    id: string
//    username: string
//    passwordHash: string
    boardsIds: string[]
    selectedBoardId: string
}