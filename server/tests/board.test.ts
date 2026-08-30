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
  it("get with unvalid user", async () => {
    const userResponse = await request(app).post("/users")
    const boardId = userResponse.body.selectedBoardId

    const response = await request(app).get(`/users/1/boards/${boardId}`)

    expect(response.status).toBe(401)

  })
  it("get does not access other user's boards", async () => {
    const userResponse = await request(app).post("/users")
    const boardId = userResponse.body.selectedBoardId
    const userResponse2 = await request(app).post("/users")
    const userId2 = userResponse2.body.id

    const response = await request(app).get(`/users/${userId2}/boards/${boardId}`)

    expect(response.status).toBe(403)
  })
  it("get with unvalid board", async () => {
    const userResponse = await request(app).post("/users")
    const userId = userResponse.body.id

    const response = await request(app).get(`/users/${userId}/boards/1`)

    expect(response.status).toBe(404)
  })
  it("Overwrite overwrites the board for a valid user and board", async () => {
    const userResponse = await request(app).post("/users")
    const userId = userResponse.body.id
    const boardId = userResponse.body.selectedBoardId

    const newBoardData = {
      title: "Updated Board",
      columns: [{ id: "col1", title: "Column 1", tasks: [] }]
    }

    const overwriteResponse = await request(app)
      .put(`/users/${userId}/boards/${boardId}/overwrite`)
      .send(newBoardData)

    expect(overwriteResponse.status).toBe(200)
    expect(overwriteResponse.body.title).toBe(newBoardData.title)
    expect(overwriteResponse.body.columns).toEqual(newBoardData.columns)

    const getResponse = await request(app).get(`/users/${userId}/boards/${boardId}`)
    expect(getResponse.status).toBe(200)
    expect(getResponse.body.title).toBe(newBoardData.title)
    expect(getResponse.body.columns).toEqual(newBoardData.columns)
  })
  it("Overwrite with unvalid user", async () => {
    const userResponse = await request(app).post("/users")
    const boardId = userResponse.body.selectedBoardId

    const newBoardData = {
      title: "Updated Board",
      columns: [{ id: "col1", title: "Column 1", tasks: [] }]
    }

    const overwriteResponse = await request(app)
      .put(`/users/1/boards/${boardId}/overwrite`)
      .send(newBoardData)

    expect(overwriteResponse.status).toBe(401)
  })
  it("Overwrite does not access other user's boards", async () => {
    const userResponse = await request(app).post("/users")
    const boardId = userResponse.body.selectedBoardId
    const userResponse2 = await request(app).post("/users")
    const userId2 = userResponse2.body.id

    const newBoardData = {
      title: "Updated Board",
      columns: [{ id: "col1", title: "Column 1", tasks: [] }]
    }

    const overwriteResponse = await request(app)
      .put(`/users/${userId2}/boards/${boardId}/overwrite`)
      .send(newBoardData)

    expect(overwriteResponse.status).toBe(403)
  })
  it("Overwrite with unvalid board", async () => {
    const userResponse = await request(app).post("/users")
    const userId = userResponse.body.id

    const newBoardData = {
      title: "Updated Board",
      columns: [{ id: "col1", title: "Column 1", tasks: [] }]
    }

    const overwriteResponse = await request(app)
      .put(`/users/${userId}/boards/1/overwrite`)
      .send(newBoardData)

    expect(overwriteResponse.status).toBe(404)
  })
})