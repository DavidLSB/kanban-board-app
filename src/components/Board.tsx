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
                    <Column tasks={column.tasks} key={column.title} title={column.title} width={300} />
                ))}
            </div>
            <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
            />
            <button onClick={addTask} style = {{ marginBottom: "10px" }}>Add Task</button>
        </div>
    )
}



export default Board