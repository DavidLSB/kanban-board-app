import type { Task as TaskType } from "./Task"

export type Task = {
  id: string
  title: string
}

type TaskProps = {
    task: TaskType
    onDelete: (taskId: string) => void
    onMove: (toColumn: string) => void
    onMoveAdjacent: (direction: "left" | "right") => void
}

function Task({ task, onDelete, onMove, onMoveAdjacent }: TaskProps) {
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
        <button onClick={() => onMoveAdjacent("left")}>⬅</button>
        <button onClick={() => onMoveAdjacent("right")}>➡</button>
    </div>
  )
}

export default Task