import type { Task } from "./Task"

type ColumnProps = {
    title: string
    width: number
    tasks: Task[]
}

function Column({ title, width, tasks }: ColumnProps) {
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
                </div>
            ))}
        </div>
    )
}

export default Column