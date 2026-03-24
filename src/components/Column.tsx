import Task from "./Task"
import type { Task as TaskType } from "./Task"

type ColumnProps = {
    title: string
    width: number
    tasks: TaskType[]
    onDeleteTask: (taskId: string, columnTitle: string) => void
    onUpdateTaskTitle: ( taskId: string, columnTitle: string, newTitle: string) => void
    onUpdateTaskDescription: (taskId: string, columnTitle: string, newDescription: string) => void
    onMoveTask: (taskId: string, fromColumn: string, toColumn: string) => void
    onMoveTaskAdjacent: (taskId: string, fromColumn: string, direction: "left" | "right") => void
    columnIndex: number
    totalColumns: number
}

function Column({ title, width, tasks, onDeleteTask, onUpdateTaskTitle, onUpdateTaskDescription, onMoveTask, onMoveTaskAdjacent, columnIndex, totalColumns }: ColumnProps) {
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