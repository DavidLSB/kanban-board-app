import { describe, it, expect, beforeEach, vi } from "vitest"
import request from "supertest"
import type { Express } from "express"

let app: Express

beforeEach(async () => {
  vi.resetModules()
  const module = await import("../src/app.js")
  app = module.default as Express
})

describe("Board API", () => {
  it("get returns the default board for a valid user and board", async () => {
    const userResponse = await request(app).post("/users")
    const userId = userResponse.body.id
    const boardId = userResponse.body.selectedBoardId

    const response = await request(app).get(`/users/${userId}/boards/${boardId}`)

    expect(response.status).toBe(200)
    expect(response.body.title).toBe("My Board")
    expect(response.body.columns).toEqual([])
    expect(response.body.id).toBe(boardId)
  })
})