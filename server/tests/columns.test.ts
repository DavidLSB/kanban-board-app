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

describe("Columns CRUD", () => {
  it("create adds the first board column", async () => {
    const response = await request(app).post("/boards/1/columns").send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
  })
  it("read reads the first board column", async () => {
    const response = await request(app).post("/boards/1/columns").send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const id = response.body.id
    const readResponse = await request(app).get(`/boards/1/columns/${id}`)

    expect(readResponse.status).toBe(200)
    expect(readResponse.body.title).toBe("My column")
    expect(readResponse.body.id).toBe(id)
  })
  it("update updates the first board column", async () => {
    const response = await request(app).post("/boards/1/columns").send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const id = response.body.id
    const updateResponse = await request(app).put(`/boards/1/columns/${id}`).send({ title: "My updated column" })

    expect(updateResponse.status).toBe(200)
    expect(updateResponse.body.title).toBe("My updated column")
    expect(updateResponse.body.id).toBe(id)
  })
  it("delete deletes the first board column", async () => {
    const response = await request(app).post("/boards/1/columns").send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const id = response.body.id
    const deleteResponse = await request(app).delete(`/boards/1/columns/${id}`)

    expect(deleteResponse.status).toBe(200)
    const readResponse = await request(app).get(`/boards/1/columns/${id}`)

    expect(readResponse.status).toBe(404)
  })
})

describe("Column Collection", () => {
  it("read reads the column collection", async () => {
    const response = await request(app).post("/boards/1/columns").send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const id = response.body.id

    const readResponse = await request(app).get(`/boards/1/columns`)

    expect(readResponse.status).toBe(200)
    console.log(readResponse.body)
    expect(readResponse.body.length).toBe(1)
    expect(readResponse.body[0].title).toBe("My column")
    expect(readResponse.body[0].id).toBe(id)
  })
})