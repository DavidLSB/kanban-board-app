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

describe("Tasks CRUD", () => {
  it("create adds the first board task", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const taskResponse = await request(app).post(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks`).send({ title: "My task", description: "My task description" })
   
    expect(taskResponse.status).toBe(201)
    expect(taskResponse.body.title).toBe("My task")
    expect(taskResponse.body.description).toBe("My task description")
  })
  it("create with unvalid column returns 404", async () => {
    const taskResponse = await request(app).post(`/users/${userId}/boards/${boardId}/columns/1/tasks`).send({ title: "My task", description: "My task description" })
   
    expect(taskResponse.status).toBe(404)
  })
  it("create with unvalid user returns 401", async () => {
    const taskResponse = await request(app).post(`/users/1/boards/${boardId}/columns/1/tasks`).send({ title: "My task", description: "My task description" })
   
    expect(taskResponse.status).toBe(401)
  })
  it("create with unvalid board returns 404", async () => {
    const taskResponse = await request(app).post(`/users/${userId}/boards/1/columns/1/tasks`).send({ title: "My task", description: "My task description" })
   
    expect(taskResponse.status).toBe(404)
  })
  it("create with valid user but not their board returns 403", async () => {
    const userResponse = await request(app).post("/users")
    const userId2 = userResponse.body.id
    const taskResponse = await request(app).post(`/users/${userId2}/boards/${boardId}/columns/1/tasks`).send({ title: "My task", description: "My task description" })
   
    expect(taskResponse.status).toBe(403)
  })
  it("create with missing title returns 400", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const taskResponse = await request(app).post(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks`).send({ description: "My task description" })
   
    expect(taskResponse.status).toBe(400)
  })
  it("create with empty title returns 400", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const taskResponse = await request(app).post(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks`).send({ title: "", description: "My task description" })
   
    expect(taskResponse.status).toBe(400)
  })
  it("create with whitespace title returns 400", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const taskResponse = await request(app).post(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks`).send({ title: "   ", description: "My task description" })
   
    expect(taskResponse.status).toBe(400)
  })
  it("read reads the first board task", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const taskResponse = await request(app).post(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks`).send({ title: "My task", description: "My task description" })
    
    expect(taskResponse.status).toBe(201)
    expect(taskResponse.body.title).toBe("My task")
    expect(taskResponse.body.description).toBe("My task description")
    const taskId = taskResponse.body.id
    const readResponse = await request(app).get(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`)

    expect(readResponse.status).toBe(200)
    expect(readResponse.body.title).toBe("My task")
    expect(readResponse.body.description).toBe("My task description")
    expect(readResponse.body.id).toBe(taskId)
  })
  it("read with unvalid column returns 404", async () => {
    const readResponse = await request(app).get(`/users/${userId}/boards/${boardId}/columns/1/tasks/1`)

    expect(readResponse.status).toBe(404)
  })
  it("read with unvalid user returns 401", async () => {
    const readResponse = await request(app).get(`/users/1/boards/${boardId}/columns/1/tasks/1`)

    expect(readResponse.status).toBe(401)
  })
  it("read with unvalid board returns 404", async () => {
    const readResponse = await request(app).get(`/users/${userId}/boards/1/columns/1/tasks/1`)

    expect(readResponse.status).toBe(404)
  })
  it("read with valid user but not their board returns 403", async () => {
    const userResponse = await request(app).post("/users")
    const userId2 = userResponse.body.id
    const readResponse = await request(app).get(`/users/${userId2}/boards/${boardId}/columns/1/tasks/1`)

    expect(readResponse.status).toBe(403)
  })
  it("read with only unvalid task returns 404", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const readResponse = await request(app).get(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks/1`)

    expect(readResponse.status).toBe(404)
  })
  it("update updates the first board task", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const taskResponse = await request(app).post(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks`).send({ title: "My task", description: "My task description" })
   
    expect(taskResponse.status).toBe(201)
    expect(taskResponse.body.title).toBe("My task")
    expect(taskResponse.body.description).toBe("My task description")
    const taskId = taskResponse.body.id
    const updateResponse = await request(app).patch(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`).send({ title: "My updated task", description: "My updated task description" })

    expect(updateResponse.status).toBe(200)
    expect(updateResponse.body.title).toBe("My updated task")
    expect(updateResponse.body.description).toBe("My updated task description")
    expect(updateResponse.body.id).toBe(taskId)
  })
  it("update with unvalid column returns 404", async () => {
    const updateResponse = await request(app).patch(`/users/${userId}/boards/${boardId}/columns/1/tasks/1`).send({ title: "My updated task", description: "My updated task description" })

    expect(updateResponse.status).toBe(404)
  })
  it("update with unvalid user returns 401", async () => {
    const updateResponse = await request(app).patch(`/users/1/boards/${boardId}/columns/1/tasks/1`).send({ title: "My updated task", description: "My updated task description" })

    expect(updateResponse.status).toBe(401)
  })
  it("update with unvalid board returns 404", async () => {
    const updateResponse = await request(app).patch(`/users/${userId}/boards/1/columns/1/tasks/1`).send({ title: "My updated task", description: "My updated task description" })

    expect(updateResponse.status).toBe(404)
  })
  it("update with valid user but not their board returns 403", async () => {
    const userResponse = await request(app).post("/users")
    const userId2 = userResponse.body.id
    const updateResponse = await request(app).patch(`/users/${userId2}/boards/${boardId}/columns/1/tasks/1`).send({ title: "My updated task", description: "My updated task description" })

    expect(updateResponse.status).toBe(403)
  })
  it("update with only unvalid task returns 404", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const updateResponse = await request(app).patch(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks/1`).send({ title: "My updated task", description: "My updated task description" })

    expect(updateResponse.status).toBe(404)
  })
  it("delete deletes the first board task", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const taskResponse = await request(app).post(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks`).send({ title: "My task", description: "My task description" })
   
    expect(taskResponse.status).toBe(201)
    expect(taskResponse.body.title).toBe("My task")
    expect(taskResponse.body.description).toBe("My task description")
    const taskId = taskResponse.body.id
    const deleteResponse = await request(app).delete(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`)
   
    expect(deleteResponse.status).toBe(200)
    const readResponse = await request(app).get(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`)

    expect(readResponse.status).toBe(404)
  })
  it("delete with unvalid column returns 404", async () => {
    const deleteResponse = await request(app).delete(`/users/${userId}/boards/${boardId}/columns/1/tasks/1`)
   
    expect(deleteResponse.status).toBe(404)
  })
  it("delete with unvalid user returns 401", async () => {
    const deleteResponse = await request(app).delete(`/users/1/boards/${boardId}/columns/1/tasks/1`)
   
    expect(deleteResponse.status).toBe(401)
  })
  it("delete with unvalid board returns 404", async () => {
    const deleteResponse = await request(app).delete(`/users/${userId}/boards/1/columns/1/tasks/1`)
   
    expect(deleteResponse.status).toBe(404)
  })
  it("delete with valid user but not their board returns 403", async () => {
    const userResponse = await request(app).post("/users")
    const userId2 = userResponse.body.id
    const deleteResponse = await request(app).delete(`/users/${userId2}/boards/${boardId}/columns/1/tasks/1`)
   
    expect(deleteResponse.status).toBe(403)
  })
  it("delete with only unvalid task returns 404", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const deleteResponse = await request(app).delete(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks/1`)
   
    expect(deleteResponse.status).toBe(404)
  })
})

describe("Task Collection", () => {
  it("read reads the task collection returns 200", async () => {
    const response = await request(app).post(`/users/${userId}/boards/${boardId}/columns`).send({ title: "My column" })

    expect(response.status).toBe(201)
    expect(response.body.title).toBe("My column")
    const columnId = response.body.id
    const taskResponse = await request(app).post(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks`).send({ title: "My task", description: "My task description" })
   
    expect(taskResponse.status).toBe(201)
    expect(taskResponse.body.title).toBe("My task")
    expect(taskResponse.body.description).toBe("My task description")
    const taskId = taskResponse.body.id
    const readResponse = await request(app).get(`/users/${userId}/boards/${boardId}/columns/${columnId}/tasks`)

    expect(readResponse.status).toBe(200)
    console.log(readResponse.body)
    expect(readResponse.body.length).toBe(1)
    expect(readResponse.body[0].title).toBe("My task")
    expect(readResponse.body[0].description).toBe("My task description")
    expect(readResponse.body[0].id).toBe(taskId)
  })
  it("read with unvalid column returns 404", async () => {
    const readResponse = await request(app).get(`/users/${userId}/boards/${boardId}/columns/1/tasks`)

    expect(readResponse.status).toBe(404)
  })
  it("read with unvalid user returns 401", async () => {
    const readResponse = await request(app).get(`/users/1/boards/${boardId}/columns/1/tasks`)

    expect(readResponse.status).toBe(401)
  })
  it("read with unvalid board returns 404", async () => {
    const readResponse = await request(app).get(`/users/${userId}/boards/1/columns/1/tasks`)

    expect(readResponse.status).toBe(404)
  })
  it("read with valid user but not their board returns 403", async () => {
    const userResponse = await request(app).post("/users")
    const userId2 = userResponse.body.id
    const readResponse = await request(app).get(`/users/${userId2}/boards/${boardId}/columns/1/tasks`)

    expect(readResponse.status).toBe(403)
  })
})