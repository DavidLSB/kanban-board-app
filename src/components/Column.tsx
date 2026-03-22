import type { Task } from "./Task"

type ColumnProps = {
    title: string
    width: number
    tasks: Task[]
    onDeleteTask: (taskId: string, columnTitle: string) => void
}

function Column({ title, width, tasks, onDeleteTask }: ColumnProps) {
    return (
        <div style={{
            border: "1px solid gray",
            width: `${width}px`,
            padding: "10px"
        }}>
            <h2>{title}</h2>

            {tasks.map((task) => (
                <div key={task.id} style={{
                    border: "1px solid black",
                    marginTop: "10px",
                    padding: "5px"
                }}>
                    {task.title}

                    <button onClick={() => onDeleteTask(task.id, title)}>
                        Delete
                    </button>
                </div>
            ))}
        </div>
    )
}

export default Column