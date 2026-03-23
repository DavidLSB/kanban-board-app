import { useState } from "react"
import Column from "./Column"
import type { Task } from "./Task"

function Board() {
    const [columns, setColumns] = useState<{ title: string, tasks: Task[] }[]>([{
        title: "To Do",
        tasks: [
            { id: "1", title: "Task 1" },
            { id: "2", title: "Task 2" }
        ]
    },
    {
        title: "Doing",
        tasks: [
            { id: "3", title: "Task 3" }
        ]
    },
    {
        title: "Done",
        tasks: []
    }
    ])
    const [newTaskTitle, setNewTaskTitle] = useState("")
    function addTask() {
        if (!newTaskTitle.trim()) return

        const newTask = {
            id: Date.now().toString(),
            title: newTaskTitle
        }

        const newColumns = [...columns]
        newColumns[0].tasks.push(newTask) // temporarely always on 'To Do' column

        setColumns(newColumns)
        setNewTaskTitle("")
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
    return (
        <div>
            <div 
                style={{
                display: "flex", 
                gap: "20px", 
                border: "2px solid gray",
                padding: "10px",
                width: "1000px"
            }}>
                {columns.map((column) => (
                    <Column 
                        tasks={column.tasks} 
                        key={column.title} 
                        title={column.title} 
                        width={300}
                        onDeleteTask={deleteTask}
                        onMoveTask={moveTaskToColumn}
                        onMoveTaskAdjacent={moveTaskAdjacent}
                    />
                ))}
            </div>
            <input
                value={newTaskTitle}
                onChange={(event) => setNewTaskTitle(event.target.value)}
                placeholder="Enter task title"
            />
            <button onClick={addTask} style = {{ marginBottom: "10px" }}>Add Task</button>
        </div>
    )
}



export default Board