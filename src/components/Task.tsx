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
    isFirstColumn: boolean
    isLastColumn: boolean
}

function Task({ task, onDelete, onMove, onMoveAdjacent, isFirstColumn, isLastColumn }: TaskProps) {
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
        <button disabled={isFirstColumn} onClick={() => onMoveAdjacent("left")}>⬅</button>
        <button disabled={isLastColumn} onClick={() => onMoveAdjacent("right")}>➡</button>
    </div>
  )
}

export default Task