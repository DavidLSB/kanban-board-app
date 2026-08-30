import { describe, it, expect, beforeEach, vi } from "vitest"
import request from "supertest"
import type { Express } from "express"

let app: Express

beforeEach(async () => {
  vi.resetModules()
  const module = await import("../src/app.js")
  app = module.default as Express
})

describe("User API", () => {
  it("POST /users creates a new user with a default board and selectedBoardId", async () => {
    const response = await request(app).post("/users")

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty("id")
    expect(response.body.boardsIds).toHaveLength(1)
    expect(response.body.selectedBoardId).toBe(response.body.boardsIds[0])
  })

  it("GET /users/:userId retrieves an existing user", async () => {
    const createResponse = await request(app).post("/users")
    const userId = createResponse.body.id

    const response = await request(app).get(`/users/${userId}`)

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(userId)
  })

  it("GET /users/:userId returns 404 if the user does not exist", async () => {
    const response = await request(app).get("/users/non-existent-id")

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty("error", "User not found")
  })
})