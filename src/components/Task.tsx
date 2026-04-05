import { useState } from "react"
import type { Task as TaskType } from "./Task"

export type Task = {
  id: string
  title: string
  description: string
}

type TaskProps = {
    task: TaskType
    onDelete: (taskId: string) => void
    onUpdateTitle: (title: string) => void
    onUpdateDescription: (desc: string) => void
    onMove: (toColumn: string) => void
    onMoveAdjacent: (direction: "left" | "right") => void
    isFirstColumn: boolean
    isLastColumn: boolean
}

function Task({ 
    task, 
    onDelete, 
    onUpdateTitle, 
    onUpdateDescription, 
    onMove, 
    onMoveAdjacent, 
    isFirstColumn, 
    isLastColumn 
}: TaskProps) {
    const [isEditingTitle, setIsEditingTitle] = useState(false)
    const [isEditingDescription, setIsEditingDescription] = useState(false)
    const [titleInput, setTitleInput] = useState(task.title)
    const [descInput, setDescInput] = useState(task.description)
    function renderTitle() {
        if (isEditingTitle) {
            return (
                <input
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={() => {
                        onUpdateTitle(titleInput)
                        setIsEditingTitle(false)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onUpdateTitle(titleInput)
                            setIsEditingTitle(false)
                        }
                    }}
                    autoFocus
                />
            )
        }

        return (
            <strong onClick={() => setIsEditingTitle(true)}>
                {task.title}
            </strong>
        )
    }
    function renderDescription() {
        if (isEditingDescription) {
            return (
                <input
                    value={descInput}
                    onChange={(e) => setDescInput(e.target.value)}
                    onBlur={() => {
                        onUpdateDescription(descInput)
                        setIsEditingDescription(false)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onUpdateDescription(descInput)
                            setIsEditingDescription(false)
                        }
                    }}
                    autoFocus
                />
            )
        }

        return (
            <p onClick={() => setIsEditingDescription(true)}>
                {task.description || "No description available."}
            </p>
        )
    }
    return (
    <div style={{
        border: "1px solid black",
        marginTop: "10px",
        padding: "5px"
    }}>
        {renderTitle()}
        {renderDescription()}
        <button disabled={isFirstColumn} onClick={() => onMoveAdjacent("left")}>⬅</button>
        <button onClick={() => onDelete(task.id)}>
            Delete
        </button>
        <button disabled={isLastColumn} onClick={() => onMoveAdjacent("right")}>➡</button>
    </div>
  )
}

export default Task