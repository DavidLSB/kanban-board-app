import type { ColumnType } from "../Column"

export function moveTaskToColumn(
    taskId: string, 
    fromColumn: string, 
    toColumn: string, 
    columns: ColumnType[]): ColumnType[] {
    const taskToMove = columns
        .find(c => c.id === fromColumn)
        ?.tasks.find(t => t.id === taskId)

    if (!taskToMove || toColumn === fromColumn) return columns

    const newColumns = columns.map(column => {
        if (column.id === fromColumn) {
        return {
            ...column,
            tasks: column.tasks.filter(t => t.id !== taskId)
        }
        }

        if (column.id === toColumn) {
        return {
            ...column,
            tasks: [...column.tasks, taskToMove]
        }
        }

        return column
    })
    return newColumns
}
export function reorderTask(taskId: string, targetTaskId: string, columns: ColumnType[]) {
    const newColumns = columns.map(column => {
        const taskIndex = column.tasks.findIndex(t => t.id === taskId)
        const targetIndex = column.tasks.findIndex(t => t.id === targetTaskId)
        if (taskIndex === -1 || targetIndex === -1) return column
        const newTasks = [...column.tasks]
        const [movedTask] = newTasks.splice(taskIndex, 1)
        newTasks.splice(targetIndex, 0, movedTask)

        return {
            ...column,
            tasks: newTasks
        }
    })
    return newColumns
}