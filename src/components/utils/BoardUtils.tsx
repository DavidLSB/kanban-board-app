import type { ColumnType } from "../Column"


// Moves a task from one column to another.
// Parameters:
// - taskId: The ID of the task to move.
// - fromColumn: The ID of the column the task is currently in.
// - toColumn: The ID of the column to move the task to.
// - columns: The current state of all columns.
// Returns:
// - Returns a new array of columns with the task moved to the new column.
export function moveTaskToColumn(
    taskId: string, 
    fromColumn: string, 
    toColumn: string, 
    columns: ColumnType[]): ColumnType[] {
    const taskToMove = columns
        .find(c => c.id === fromColumn)
        ?.tasks.find(t => t.id === taskId)

    if (!taskToMove || toColumn === fromColumn || !columns.find(c => c.id === toColumn)) return columns

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

// Moves a task to the position of another task of the same column, pushing other tasks down as needed.
// Parameters:
// - taskId: The ID of the task to reorder.
// - targetTaskId: The ID of the task that will be the new position of the moved task.
// - columns: The current state of all columns.
// Returns:
// - Returns a new array of columns with the task reordered within its column.
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