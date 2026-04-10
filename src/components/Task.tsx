import { useState } from "react"
import type { Task as TaskType } from "./Task"
import { useDraggable } from "@dnd-kit/core"

export type Task = {
  id: string
  title: string
  description: string
}

type TaskProps = {
    task: TaskType
    isOverlay?: boolean
    onDelete?: (taskId: string) => void
    onUpdateTitle?: (title: string) => void
    onUpdateDescription?: (desc: string) => void
    onMove?: (toColumn: string) => void
    onMoveAdjacent?: (direction: "left" | "right") => void
    isFirstColumn?: boolean
    isLastColumn?: boolean
}

function Task({ 
    task,
    isOverlay, 
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
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: task.id,
        data: {
            task: task
        }
    })
    function renderTitle() {
        if (isEditingTitle) {
            return (
                <input
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={() => {
                        onUpdateTitle?.(titleInput)
                        setIsEditingTitle(false)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onUpdateTitle?.(titleInput)
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
                        onUpdateDescription?.(descInput)
                        setIsEditingDescription(false)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onUpdateDescription?.(descInput)
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
    if (isOverlay) {
        return (
            <div
                style={{
                    border: "1px solid black",
                    marginTop: "10px",
                    padding: "5px",
                    opacity: 0.4,
                    transform: "scale(1.05)",
                    boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
                    zIndex: 1000
            }}>
            <div
                style={{
                    cursor: "grabbing",
                    background: "#eee",
                    padding: "2px",
                    marginBottom: "5px"
                }}
            >
                ⠿ Drag
            </div>
            {renderTitle()}
            {renderDescription()}
            <button disabled={true}>⬅</button>
            <button disabled={true}>
                Delete
            </button>
            <button disabled={true}>➡</button>
        </div>
        )
    }
    return (
        <div
            ref={setNodeRef}
            style={{
                border: "1px solid black",
                marginTop: "10px",
                padding: "5px",
                opacity: isDragging ? 0.4 : 1,
                transform: isDragging ? "scale(1.05)" : "scale(1)",
                boxShadow: isDragging ? "0px 5px 15px rgba(0,0,0,0.2)" : "none",
                zIndex: isDragging ? 1000 : "auto"
        }}>
            <div
                {...listeners}
                {...attributes}
                style={{
                    cursor: isDragging ? "grabbing" : "grab",
                    background: "#eee",
                    padding: "2px",
                    marginBottom: "5px"
                }}
            >
                ⠿ Drag
            </div>
            {renderTitle()}
            {renderDescription()}
            <button disabled={isFirstColumn} onClick={() => onMoveAdjacent?.("left")}>⬅</button>
            <button onClick={() => onDelete?.(task.id)}>
                Delete
            </button>
            <button disabled={isLastColumn} onClick={() => onMoveAdjacent?.("right")}>➡</button>
        </div>
    )
}

export default Task