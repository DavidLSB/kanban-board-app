import { describe, it, expect, beforeEach, vi } from "vitest"
import request from "supertest"
import type { Express } from "express"
import { Board } from "../src/types/Board.js"

const initialBoard: Board = {
  id: "1",
  title: "My board",
  columns: []
}

const board = structuredClone(initialBoard)

export function resetBoardForTests() {
  Object.assign(board, structuredClone(initialBoard))
}

let app: Express

beforeEach(async () => {
  resetBoardForTests()
  vi.resetModules()
  const module = await import("../src/app.js")
  app = module.default as Express
})

describe("Board API", () => {
  it("get returns the default board", async () => {
    const response = await request(app).get("/boards")

    expect(response.status).toBe(200)
    expect(response.body.id).toBe("1")
    expect(response.body.title).toBe("My board")
  })
})