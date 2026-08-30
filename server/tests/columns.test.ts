import { describe, it, expect, beforeEach, vi } from "vitest"
import request from "supertest"
import type { Express } from "express"
let app: Express
let userId: string
let boardId: string
beforeEach(async () => {
  vi.resetModules()
  const module = await import("../src/app.js")
  app = module.default as Express
  const userResponse = await request(app).post("/users")
  userId = userResponse.body.id
  boardId = userResponse.body.selectedBoardId
})

describe("Columns CRUD", () => {
  it("create adds the first board column", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
  })
  it("create with unvalid board returns 404", async () => {
    const response = await request(app).post(`/users/${userId}/boards/1/columns`).send({ title: "My column" })

    expect(response.status).toBe(404)
  })
  it("create with unvalid user returns 401", async () => {
    const response = await request(app).post(`/users/1/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(401)
  })
  it("create with real user but not their board returns 403", async () => {
    const userResponse2 = await request(app).post("/users")
    const userId2 = userResponse2.body.id

    const response = await request(app).post(`/users/${userId2}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(403)
  })
  it("create with empty title returns 400", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "" })

    expect(response.status).toBe(400)
  })
  it("create with missing title returns 400", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({})

    expect(response.status).toBe(400)
  })
  it("read reads the first board column", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const id = response.body.id
    const readResponse = await request(app).get(`/users/${userId}/boards/${boardId}/columns/${id}`)

    expect(readResponse.status).toBe(200)
    expect(readResponse.body.title).toBe("My column")
    expect(readResponse.body.id).toBe(id)
  })
  it("read with unvalid column returns 404", async () => {
    const readResponse = await request(app).get(`/users/${userId}/boards/${boardId}/columns/1`)

    expect(readResponse.status).toBe(404)
  })
  it("read with unvalid board returns 404", async () => {
    const readResponse = await request(app).get(`/users/${userId}/boards/1/columns/1`)

    expect(readResponse.status).toBe(404)
  })
  it("read with unvalid user returns 401", async () => {
    const readResponse = await request(app).get(`/users/1/boards/${boardId}/columns/1`)

    expect(readResponse.status).toBe(401)
  })
  it("read with real user but not their board returns 403", async () => {
    const userResponse2 = await request(app).post("/users")
    const userId2 = userResponse2.body.id

    const readResponse = await request(app).get(`/users/${userId2}/boards/${boardId}/columns/1`)

    expect(readResponse.status).toBe(403)
  })
  it("update updates the first board column", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const id = response.body.id
    const updateResponse = await request(app).patch(`/users/${userId}/boards/${boardId}/columns/${id}`).send({ title: "My updated column" })

    expect(updateResponse.status).toBe(200)
    expect(updateResponse.body.title).toBe("My updated column")
    expect(updateResponse.body.id).toBe(id)
  })
  it("update with unvalid column returns 404", async () => {
    const updateResponse = await request(app).patch(`/users/${userId}/boards/${boardId}/columns/1`).send({ title: "My updated column" })

    expect(updateResponse.status).toBe(404)
  })
  it("update with unvalid board returns 404", async () => {
    const updateResponse = await request(app).patch(`/users/${userId}/boards/1/columns/1`).send({ title: "My updated column" })

    expect(updateResponse.status).toBe(404)
  })
  it("update with unvalid user returns 401", async () => {
    const updateResponse = await request(app).patch(`/users/1/boards/${boardId}/columns/1`).send({ title: "My updated column" })

    expect(updateResponse.status).toBe(401)
  })
  it("update with real user but not their board returns 403", async () => {
    const userResponse2 = await request(app).post("/users")
    const userId2 = userResponse2.body.id

    const updateResponse = await request(app).patch(`/users/${userId2}/boards/${boardId}/columns/1`).send({ title: "My updated column" })

    expect(updateResponse.status).toBe(403)
  })
  it("update with no title and no index returns 400", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })
    
    const updateResponse = await request(app).patch(`/users/${userId}/boards/${boardId}/columns/${response.body.id}`).send({})
    expect(updateResponse.status).toBe(400)
  })
  it("delete deletes the first board column", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const id = response.body.id
    const deleteResponse = await request(app).delete(`/users/${userId}/boards/${boardId}/columns/${id}`)

    expect(deleteResponse.status).toBe(200)
    const readResponse = await request(app).get(`/users/${userId}/boards/${boardId}/columns/${id}`)

    expect(readResponse.status).toBe(404)
  })
  it("delete with unvalid column returns 404", async () => {
    const deleteResponse = await request(app).delete(`/users/${userId}/boards/${boardId}/columns/1`)

    expect(deleteResponse.status).toBe(404)
  })
  it("delete with unvalid board returns 404", async () => {
    const deleteResponse = await request(app).delete(`/users/${userId}/boards/1/columns/1`)

    expect(deleteResponse.status).toBe(404)
  })
  it("delete with unvalid user returns 401", async () => {
    const deleteResponse = await request(app).delete(`/users/1/boards/${boardId}/columns/1`)

    expect(deleteResponse.status).toBe(401)
  })
  it("delete with real user but not their board returns 403", async () => {
    const userResponse2 = await request(app).post("/users")
    const userId2 = userResponse2.body.id

    const deleteResponse = await request(app).delete(`/users/${userId2}/boards/${boardId}/columns/1`)

    expect(deleteResponse.status).toBe(403)
  })
})

describe("Column Collection", () => {
  it("read reads the column collection", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const id = response.body.id

    const readResponse = await request(app).get(`/users/${userId}/boards/${boardId}/columns`)

    expect(readResponse.status).toBe(200)
    console.log(readResponse.body)
    expect(readResponse.body.length).toBe(1)
    expect(readResponse.body[0].title).toBe("My column")
    expect(readResponse.body[0].id).toBe(id)
  })
  it("read with unvalid board returns 404", async () => {
    const readResponse = await request(app).get(`/users/${userId}/boards/1/columns`)

    expect(readResponse.status).toBe(404)
  })
  it("read with unvalid user returns 401", async () => {
    const readResponse = await request(app).get(`/users/1/boards/${boardId}/columns`)

    expect(readResponse.status).toBe(401)
  })
  it("read with real user but not their board returns 403", async () => {
    const userResponse2 = await request(app).post("/users")
    const userId2 = userResponse2.body.id

    const readResponse = await request(app).get(`/users/${userId2}/boards/${boardId}/columns`)

    expect(readResponse.status).toBe(403)
  })
})