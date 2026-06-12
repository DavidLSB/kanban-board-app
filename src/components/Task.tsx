import { useState } from "react"
import type { Task as TaskType } from "./Task"
import { useDraggable, useDroppable } from "@dnd-kit/core"

export type Task = {
  id: string
  title: string
  description: string
}

type TaskProps = {
    task: TaskType
    preview?: {
        taskId: string
        position: "above" | "below"
    } | null
    columnId?: string
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
    preview,
    columnId,
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
            type: "task",
            task: task,
            columnId: columnId
        }
    })
    const { setNodeRef: setDropRef } = useDroppable({
        id: task.id,
        data: {
            type: "task",
            columnId: columnId
        }
    })
    function renderTitle() {
        if (isEditingTitle) {
            return (
                <input
                    value={titleInput}
                    style={{fontSize: "18px"}}
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
            <strong onClick={() => setIsEditingTitle(true)} style={{fontSize: "18px"}}>
                {task.title}
            </strong>
        )
    }
    function renderDescription() {
        if (isEditingDescription) {
            return (
                <input
                    value={descInput}
                    style={{fontSize: "18px"}}
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
            <p onClick={() => setIsEditingDescription(true)} style={{fontSize: "18px"}}>
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
            <button disabled={true} style={{minHeight: "44px", minWidth: "66px", fontSize: "18px"}}>⬅</button>
            <button disabled={true} style={{minHeight: "44px", minWidth: "88px", fontSize: "18px"}}>
                Delete
            </button>
            <button disabled={true} style={{minHeight: "44px", minWidth: "66px", fontSize: "18px"}}>➡</button>
        </div>
        )
    }
    return (
        <div
            ref={(node) => {
                setNodeRef(node)
                setDropRef(node)
            }}
            style={{
                border: "1px solid black",
                marginTop: "10px",
                padding: "5px",
                opacity: isDragging ? 0.4 : 1,
                transform: isDragging ? "scale(1.05)" : "scale(1)",
                boxShadow: isDragging ? "0px 5px 15px rgba(0,0,0,0.2)" : "none",
                zIndex: isDragging ? 1000 : "auto"
        }}>
            {preview?.taskId === task.id && preview.position === "above" && (
                <div style={{
                    height: "4px",
                    background: "blue",
                    marginBottom: "4px"
                }} />
            )}
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
            <button disabled={isFirstColumn} onClick={() => onMoveAdjacent?.("left")} style={{minHeight: "44px", minWidth: "66px", fontSize: "18px"}}>⬅</button>
            <button onClick={() => onDelete?.(task.id)} style={{minHeight: "44px", minWidth: "88px", fontSize: "18px"}}>
                Delete
            </button>
            <button disabled={isLastColumn} onClick={() => onMoveAdjacent?.("right")} style={{minHeight: "44px", minWidth: "66px", fontSize: "18px"}}>➡</button>
            {preview?.taskId === task.id && preview.position === "below" && (
                <div style={{
                    height: "4px",
                    background: "blue",
                    marginBottom: "4px"
                }} />
            )}
        </div>
    )
}

export default Task