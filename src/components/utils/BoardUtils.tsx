import type { ColumnType } from "../Column"
import type { Task as TaskType } from "../Task"

// Re-indexes all tasks within a column.
// Parameters:
// - tasks: The current state of all tasks within a column.
// Returns:
// - Returns a new array of tasks with their indexes updated.
export function reindexTasks(tasks: TaskType[]) {
    return tasks.map((task, index) => ({
        ...task,
        index
    }))
}

// Re-indexes all columns.
// Parameters:
// - columns: The current state of all columns.
// Returns:
// - Returns a new array of columns with their indexes updated.
export function reindexColumns(columns: ColumnType[]) {
    return columns.map((column, index) => ({
        ...column,
        index
    }))
}

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
    const sourceColumn = columns.find(c => c.id === fromColumn)
    const targetColumn = columns.find(c => c.id === toColumn)

    if (!sourceColumn || !targetColumn || fromColumn === toColumn) return columns

    const taskToMove = sourceColumn.tasks.find(t => t.id === taskId)

    if (!taskToMove) return columns

    const newColumns = columns.map(column => {
        if (column.id === fromColumn) {
            const filtered = column.tasks.filter(t => t.id !== taskId)
            return {
                ...column,
                tasks: reindexTasks(filtered)
            }
        }

        if (column.id === toColumn) {
            const newTask = { ...taskToMove, index: column.tasks.length }
            return {
                ...column,
                tasks: [...column.tasks, newTask]
            }
        }

        return column
    })
    return newColumns
}

// Moves a task to the position directly above or below another task of the same column, pushing other tasks down as needed.
// Parameters:
// - taskId: The ID of the task to reorder.
// - targetTaskId: The ID of the task that will be the new position of the moved task.
// - position: The position relative to the target task ("above" or "below").
// - columns: The current state of all columns.
// Returns:
// - Returns a new array of columns with the task reordered within its column.
export function reorderTask(taskId: string, targetTaskId: string, position: "above" | "below", columns: ColumnType[]) {
    const newColumns = columns.map(column => {
        const taskIndex = column.tasks.findIndex(t => t.id === taskId)
        const targetIndex = column.tasks.findIndex(t => t.id === targetTaskId)

        if (taskIndex === -1 || targetIndex === -1) return column

        const newTasks = [...column.tasks]
        const [movedTask] = newTasks.splice(taskIndex, 1)

        let adjustedTargetIndex = targetIndex
        if (taskIndex < targetIndex) {
            adjustedTargetIndex -= 1
        
        }
        if (position === "below") {
            adjustedTargetIndex += 1
        } 
        newTasks.splice(adjustedTargetIndex, 0, movedTask)

        return {
            ...column,
            tasks: reindexTasks(newTasks) // Re-index tasks after reordering
        }
    })
    return newColumns
}