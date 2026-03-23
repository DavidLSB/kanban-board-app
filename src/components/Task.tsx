import type { Task as TaskType } from "./Task"

export type Task = {
  id: string
  title: string
}

type TaskProps = {
    task: TaskType
    onDelete: (taskId: string) => void
}

function Task({ task, onDelete }: TaskProps) {
    return (
    <div style={{
        border: "1px solid black",
        marginTop: "10px",
        padding: "5px"
    }}>
        {task.title}

        <button onClick={() => onDelete(task.id)}>
            Delete
        </button>
    </div>
  )
}

export default Task