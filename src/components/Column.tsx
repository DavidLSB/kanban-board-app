import Task from "./Task"
import type { Task as TaskType } from "./Task"

type ColumnProps = {
    title: string
    width: number
    tasks: TaskType[]
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
                <Task
                    key={task.id}
                    task={task}
                    onDelete={(taskId) => onDeleteTask(taskId, title)}
                />
            ))}
        </div>
    )
}

export default Column