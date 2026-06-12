import { useState } from "react"
import Task from "./Task"
import type { Task as TaskType } from "./Task"
import { useDroppable } from "@dnd-kit/core"
import {useSortable } from '@dnd-kit/sortable'

export type ColumnType = {
    id: string
    title: string
    tasks: TaskType[]
}

type ColumnProps = {
    id: string
    title: string
    width: number
    tasks: TaskType[]
    columnIndex: number
    totalColumns: number
    onUpdateColumnTitle: (oldTitle: string, newTitle: string) => void
    onMoveColumnAdjacent: (index: number, direction: "left" | "right") => void
    onDeleteColumn: (index: number) => void
    // ====================
    // Tasks prop drilling
    // ====================
    taskPreview?: {
        taskId: string
        position: "above" | "below"
    } | null
    onDeleteTask: (taskId: string, columnTitle: string) => void
    onUpdateTaskTitle: ( taskId: string, columnTitle: string, newTitle: string) => void
    onUpdateTaskDescription: (taskId: string, columnTitle: string, newDescription: string) => void
    onMoveTask: (taskId: string, fromColumn: string, toColumn: string) => void
    onMoveTaskAdjacent: (taskId: string, fromColumn: string, direction: "left" | "right") => void
}

function Column({
    id,
    title,
    width,
    tasks,
    columnIndex,
    totalColumns,
    onUpdateColumnTitle,
    onMoveColumnAdjacent,
    onDeleteColumn, 
    // ====================
    // Tasks prop drilling
    // ====================
    taskPreview,
    onDeleteTask, 
    onUpdateTaskTitle, 
    onUpdateTaskDescription, 
    onMoveTask,
    onMoveTaskAdjacent
}: ColumnProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [titleInput, setTitleInput] = useState(title)
    const { setNodeRef, isOver } = useDroppable({id: id})
    const {
    attributes,
    listeners,
    setNodeRef: setColumnNodeRef,
    isDragging
    } = useSortable({
        id: id,
        data: {
            type: "column"
        }
    })
    const combinedRef = (node: HTMLElement | null) => {
        setColumnNodeRef(node)
        setNodeRef(node)
    }
    function renderTitle() {
        if (isEditing) {
            return (
                <input
                    value={titleInput}
                    style={{fontSize: "22px"}}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={() => {
                        onUpdateColumnTitle(id, titleInput)
                        setIsEditing(false)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onUpdateColumnTitle(id, titleInput)
                            setIsEditing(false)
                        }
                    }}
                    autoFocus
                />
            )
        }

        return (
            <h2 onClick={() => setIsEditing(true)} style={{fontSize: "22px"}}>
                {title}
            </h2>
        )
    }
    return (
        <div 
            ref = {combinedRef}
            style={{
                width: `${width}px`,
                padding: "10px",
                flexShrink: 0,
                border: isOver ? "2px solid blue" : "1px solid gray",
                backgroundColor: isOver ? "#f0f8ff" : "white"
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
            >⠿ Drag
            </div>
            {renderTitle()}
            {tasks.map((task) => (
                <Task
                    key={task.id}
                    task={task}
                    preview={taskPreview}
                    columnId={id}
                    isOverlay={false}
                    onDelete={(taskId) => onDeleteTask(taskId, title)}
                    onUpdateTitle={(newTitle) => onUpdateTaskTitle(task.id, title, newTitle)}
                    onUpdateDescription={(desc) => onUpdateTaskDescription(task.id, title, desc)}
                    onMove={(toColumn) => onMoveTask(task.id, title, toColumn)}
                    onMoveAdjacent={(direction) => onMoveTaskAdjacent(task.id, title, direction)}
                    isFirstColumn={columnIndex === 0}
                    isLastColumn={columnIndex === totalColumns - 1}
                />
            ))}
            <button disabled={columnIndex === 0} onClick={() => onMoveColumnAdjacent(columnIndex, "left")} style={{minHeight: "44px", minWidth: "66px", fontSize: "18px"}}>⬅</button>
            <button onClick={() => onDeleteColumn(columnIndex)} style={{minHeight: "44px", minWidth: "88px", fontSize: "18px"}}>
                Delete
            </button>
            <button disabled={columnIndex === totalColumns - 1} onClick={() => onMoveColumnAdjacent(columnIndex, "right")} style={{minHeight: "44px", minWidth: "66px", fontSize: "18px"}}>➡</button>
        </div>
    )
}

export default Column