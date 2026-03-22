import { useState } from "react"
import Column from "./Column"
import type { Task } from "./Task"

function Board() {
    const [columns, setColumns] = useState<{ title: string, tasks: Task[] }[]>([
    {
        title: "To Do",
        tasks: [
            { id: "1", title: "Task A" },
            { id: "2", title: "Task B" }
        ]
    },
    {
        title: "Doing",
        tasks: [
            { id: "3", title: "Task C" }
        ]
    },
    {
        title: "Done",
        tasks: []
    }
    ])
    return (
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
    )
}

export default Board