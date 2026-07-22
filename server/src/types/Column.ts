import type { Task } from "./Task.ts"

export interface Column {
    id: string
    title: string
    index: number
    tasks: Task[]
}