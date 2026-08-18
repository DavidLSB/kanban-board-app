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

describe("Tasks CRUD", () => {
  it("create adds the first board task", async () => {
    const response = await request(app).post("/boards/1/columns").send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const taskResponse = await request(app).post(`/boards/1/columns/${columnId}/tasks`).send({ title: "My task", description: "My task description" })
   
    expect(taskResponse.status).toBe(201)
    expect(taskResponse.body.title).toBe("My task")
    expect(taskResponse.body.description).toBe("My task description")
  })
  it("read reads the first board task", async () => {
    const response = await request(app).post("/boards/1/columns").send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const taskResponse = await request(app).post(`/boards/1/columns/${columnId}/tasks`).send({ title: "My task", description: "My task description" })
    
    expect(taskResponse.status).toBe(201)
    expect(taskResponse.body.title).toBe("My task")
    expect(taskResponse.body.description).toBe("My task description")
    const taskId = taskResponse.body.id
    const readResponse = await request(app).get(`/boards/1/columns/${columnId}/tasks/${taskId}`)

    expect(readResponse.status).toBe(200)
    expect(readResponse.body.title).toBe("My task")
    expect(readResponse.body.description).toBe("My task description")
    expect(readResponse.body.id).toBe(taskId)
  })
  it("update updates the first board task", async () => {
    const response = await request(app).post("/boards/1/columns").send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const taskResponse = await request(app).post(`/boards/1/columns/${columnId}/tasks`).send({ title: "My task", description: "My task description" })
   
    expect(taskResponse.status).toBe(201)
    expect(taskResponse.body.title).toBe("My task")
    expect(taskResponse.body.description).toBe("My task description")
    const taskId = taskResponse.body.id
    const updateResponse = await request(app).put(`/boards/1/columns/${columnId}/tasks/${taskId}`).send({ title: "My updated task", description: "My updated task description" })

    expect(updateResponse.status).toBe(200)
    expect(updateResponse.body.title).toBe("My updated task")
    expect(updateResponse.body.description).toBe("My updated task description")
    expect(updateResponse.body.id).toBe(taskId)
  })
  it("delete deletes the first board task", async () => {
    const response = await request(app).post("/boards/1/columns").send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const taskResponse = await request(app).post(`/boards/1/columns/${columnId}/tasks`).send({ title: "My task", description: "My task description" })
   
    expect(taskResponse.status).toBe(201)
    expect(taskResponse.body.title).toBe("My task")
    expect(taskResponse.body.description).toBe("My task description")
    const taskId = taskResponse.body.id
    const deleteResponse = await request(app).delete(`/boards/1/columns/${columnId}/tasks/${taskId}`)
   
    expect(deleteResponse.status).toBe(200)
    const readResponse = await request(app).get(`/boards/1/columns/${columnId}/tasks/${taskId}`)

    expect(readResponse.status).toBe(404)
  })
})

describe("Task Collection", () => {
  it("read reads the task collection", async () => {
    const response = await request(app).post("/boards/1/columns").send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const taskResponse = await request(app).post(`/boards/1/columns/${columnId}/tasks`).send({ title: "My task", description: "My task description" })
   
    expect(taskResponse.status).toBe(201)
    expect(taskResponse.body.title).toBe("My task")
    expect(taskResponse.body.description).toBe("My task description")
    const taskId = taskResponse.body.id
    const readResponse = await request(app).get(`/boards/1/columns/${columnId}/tasks`)

    expect(readResponse.status).toBe(200)
    console.log(readResponse.body)
    expect(readResponse.body.length).toBe(1)
    expect(readResponse.body[0].title).toBe("My task")
    expect(readResponse.body[0].description).toBe("My task description")
    expect(readResponse.body[0].id).toBe(taskId)
  })
})