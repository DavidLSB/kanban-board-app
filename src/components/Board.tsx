import { useState } from "react"
import Column from "./Column"
import type { Task } from "./Task"

function Board() {
    const [columns, setColumns] = useState<{ title: string, tasks: Task[] }[]>([
    {
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
    function addTask() {
        const newTask = {
            id: Date.now().toString(),
            title: `Task ${columns[0].tasks.length + 2}`
        }

        const newColumns = [...columns]
        newColumns[0].tasks.push(newTask) // temporarely always on 'To Do' column

        setColumns(newColumns)
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
            <button onClick={addTask} style = {{ marginBottom: "10px" }}>Add Task</button>
        </div>
    )
}



export default Board