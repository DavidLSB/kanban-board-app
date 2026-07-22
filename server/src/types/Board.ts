import type { Column } from "./Column.ts"

export interface Board {
    id: string
    title: string
    columns: Column[]
}