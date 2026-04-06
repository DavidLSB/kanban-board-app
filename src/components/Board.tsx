import { useState } from "react"
import { DndContext } from "@dnd-kit/core"
import Column from "./Column"
import type { Task } from "./Task"


function Board() {
    const [columns, setColumns] = useState<{ id: string, title: string, tasks: Task[] }[]>([{
            id : crypto.randomUUID(),
            title: "To Do",
            tasks: [
                { id: crypto.randomUUID(), title: "Task 1", description: "" },
                { id: crypto.randomUUID(), title: "Task 2", description: "" }
            ]
        },
        {
            id : crypto.randomUUID(),
            title: "Doing",
            tasks: [
                { id: crypto.randomUUID(), title: "Task 3", description: "" }
            ]
        },
        {
            id : crypto.randomUUID(),
            title: "Done",
            tasks: []
        }
    ])
    const [newColumnTitle, setNewColumnTitle] = useState("")
    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [newTaskDescription, setNewTaskDescription] = useState("")
    // ====================
    // COLUMNS
    // ====================
    function addColumn() {
        if (!newColumnTitle.trim()) return

        const newColumn = {
            id : crypto.randomUUID(),
            title: newColumnTitle,
            tasks: []
        }

        setColumns([...columns, newColumn])
        setNewColumnTitle("")
    }  
    function updateColumnTitle(oldTitle: string, newTitle: string) {
        if (!newTitle.trim()) return

        const newColumns = columns.map(column => {
            if (column.title !== oldTitle) return column

            return {
                ...column,
                title: newTitle
            }
        })

        setColumns(newColumns)
    }
    function deleteColumn(index: number) {
        const newColumns = columns.filter((_, i) => i !== index)
        setColumns(newColumns)
    }
    // ====================
    // TASKS
    // ====================
    function addTask() {
        if (!newTaskTitle.trim()) return

        const newTask = {
            id : crypto.randomUUID(),
            title: newTaskTitle,
            description: newTaskDescription
        }

        const newColumns = [...columns]
        newColumns[0].tasks.push(newTask) // temporarely always on 'To Do' column

        setColumns(newColumns)
        setNewTaskTitle("")
        setNewTaskDescription("")
    }
    function updateTaskTitle( taskId: string, columnTitle: string, newTitle: string ) {
        const newColumns = columns.map((column) => {
            if (column.title !== columnTitle) return column

            return {
            ...column,
            tasks: column.tasks.map((task) =>
                task.id === taskId
                ? { ...task, title: newTitle }
                : task
            )
            }
        })

        setColumns(newColumns)
    }
    function updateTaskDescription( taskId: string, columnTitle: string, newDescription: string ) {
        const newColumns = columns.map((column) => {
            if (column.title !== columnTitle) return column

            return {
                ...column,
                tasks: column.tasks.map((task) => {
                    if (task.id === taskId) {
                        return { ...task, description: newDescription }
                    } else {
                        return task
                    }
                })
            }
        })

        setColumns(newColumns)
    }
    function deleteTask(taskId: string, columnTitle: string) {
        const newColumns = columns.map((column) => {
            if (column.title !== columnTitle) return column

            return {
            ...column,
            tasks: column.tasks.filter((t) => t.id !== taskId)
        }
    })

    setColumns(newColumns)
    }
    // ====================
    // TASKS MOVEMENT
    // ====================
    function moveTaskToColumn(taskId: string, fromColumn: string, toColumn: string) {
        const taskToMove = columns
            .find(c => c.title === fromColumn)
            ?.tasks.find(t => t.id === taskId)

        if (!taskToMove) return

        const newColumns = columns.map(column => {
            if (column.title === fromColumn) {
            return {
                ...column,
                tasks: column.tasks.filter(t => t.id !== taskId)
            }
            }

            if (column.title === toColumn) {
            return {
                ...column,
                tasks: [...column.tasks, taskToMove]
            }
            }

            return column
        })

        setColumns(newColumns)
    }
    function moveTaskAdjacent(taskId: string, fromColumn: string, direction: "left" | "right") {
        const index = columns.findIndex(c => c.title === fromColumn)

        let targetIndex: number;
        if (direction === "left") {
            targetIndex = index - 1;
        } else {
            targetIndex = index + 1;
        }

        if (targetIndex < 0 || targetIndex >= columns.length) return

        const targetColumn = columns[targetIndex].title

        moveTaskToColumn(taskId, fromColumn, targetColumn)
    }
    // ====================
    // COLUMNS MOVEMENT
    // ====================
    function moveColumnAdjacent(index: number, direction: "left" | "right") {
        const newColumns = [...columns]

        let targetIndex: number;
        if (direction === "left") {
            targetIndex = index - 1;
        } else {
            targetIndex = index + 1;
        }

        if (targetIndex < 0 || targetIndex >= columns.length) return

        const temp = newColumns[index]
        newColumns[index] = newColumns[targetIndex]
        newColumns[targetIndex] = temp

        setColumns(newColumns)
    }
    // ====================
    // DRAG & DROP
    // ====================
    function handleDragEnd(event: any) {
        const { active, over } = event

        console.log("drag end:", active, over)
    }
    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div>
                <div 
                    style={{
                    display: "flex", 
                    gap: "20px", 
                    border: "2px solid gray",
                    padding: "10px",
                    width: "1000px"
                }}>
                    {columns.map((column, index) => (
                        <Column 
                            key={column.id} 
                            tasks={column.tasks} 
                            title={column.title} 
                            width={300}
                            onDeleteTask={deleteTask}
                            onUpdateTaskTitle={updateTaskTitle}
                            onUpdateTaskDescription={updateTaskDescription}
                            onMoveTask={moveTaskToColumn}
                            onMoveTaskAdjacent={moveTaskAdjacent}
                            columnIndex={index}
                            totalColumns={columns.length}
                            onUpdateColumnTitle={updateColumnTitle}
                            onMoveColumnAdjacent={moveColumnAdjacent}
                            onDeleteColumn={deleteColumn}
                        />
                    ))}
                </div>
                <div style={{ display: "flex", gap: "10px", padding: "10px"}}>
                    <input
                        value={newTaskTitle}
                        onChange={(event) => setNewTaskTitle(event.target.value)}
                        placeholder="Enter task title"
                    />
                    <input
                        value={newTaskDescription}
                        onChange={(event) => setNewTaskDescription(event.target.value)}
                        placeholder="Enter description"
                    />
                    <button onClick={addTask} style = {{ marginBottom: "10px" }}>Add Task</button>
                </div>
                <div style={{ display: "flex", gap: "10px", padding: "10px"}}>
                    <input
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        placeholder="New column"
                    />
                    <button onClick={addColumn}>Add Column</button>
                </div>
            </div>
        </DndContext>
    )
}



export default Board