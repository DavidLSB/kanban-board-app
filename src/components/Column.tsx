import { useState } from "react"
import Task from "./Task"
import type { Task as TaskType } from "./Task"

type ColumnProps = {
    title: string
    width: number
    tasks: TaskType[]
    columnIndex: number
    totalColumns: number
    onUpdateColumnTitle: (oldTitle: string, newTitle: string) => void
    // ====================
    // Tasks prop drilling
    // ====================
    onDeleteTask: (taskId: string, columnTitle: string) => void
    onUpdateTaskTitle: ( taskId: string, columnTitle: string, newTitle: string) => void
    onUpdateTaskDescription: (taskId: string, columnTitle: string, newDescription: string) => void
    onMoveTask: (taskId: string, fromColumn: string, toColumn: string) => void
    onMoveTaskAdjacent: (taskId: string, fromColumn: string, direction: "left" | "right") => void
}

function Column({ title, width, tasks, onDeleteTask, onUpdateTaskTitle, onUpdateTaskDescription, onMoveTask, onMoveTaskAdjacent, columnIndex, totalColumns, onUpdateColumnTitle }: ColumnProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [titleInput, setTitleInput] = useState(title)
    function renderTitle() {
        if (isEditing) {
            return (
                <input
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={() => {
                        onUpdateColumnTitle(title, titleInput)
                        setIsEditing(false)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            onUpdateColumnTitle(title, titleInput)
                            setIsEditing(false)
                        }
                    }}
                    autoFocus
                />
            )
        }

        return (
            <h2 onClick={() => setIsEditing(true)}>
                {title}
            </h2>
        )
    }
    return (
        <div style={{
            border: "1px solid gray",
            width: `${width}px`,
            padding: "10px"
        }}>
            {renderTitle()}
            {tasks.map((task) => (
                <Task
                    key={task.id}
                    task={task}
                    onDelete={(taskId) => onDeleteTask(taskId, title)}
                    onUpdateTitle={(newTitle) => onUpdateTaskTitle(task.id, title, newTitle)}
                    onUpdateDescription={(desc) => onUpdateTaskDescription(task.id, title, desc)}
                    onMove={(toColumn) => onMoveTask(task.id, title, toColumn)}
                    onMoveAdjacent={(direction) => onMoveTaskAdjacent(task.id, title, direction)}
                    isFirstColumn={columnIndex === 0}
                    isLastColumn={columnIndex === totalColumns - 1}
                />
            ))}
        </div>
    )
}

export default Column