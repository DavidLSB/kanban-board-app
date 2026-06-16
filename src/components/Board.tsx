import { useState, useEffect } from "react"
import { DndContext } from "@dnd-kit/core"
import { DragOverlay } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import Column from "./Column"
import type { ColumnType } from "./Column"
import type { Task as TaskType} from "./Task"
import Task from "./Task"
import { moveTaskToColumn, reorderTask } from "./utils/BoardUtils"
const DEFAULT_COLUMNS: ColumnType[] = [{
        id : crypto.randomUUID(),
        title: "To Do",
        tasks: [
            { id: crypto.randomUUID(), title: "Task 1", description: "" },
            { id: crypto.randomUUID(), title: "Task 2", description: "" }
        ]
    },
    {
        id : crypto.randomUUID(),
        title: "Doing",
        tasks: [
            { id: crypto.randomUUID(), title: "Task 3", description: "" }
        ]
    },
    {
        id : crypto.randomUUID(),
        title: "Done",
        tasks: []
    }
]

function Board() {
    
    function loadColumns(): ColumnType[] {
        const prevData = localStorage.getItem("board-data")
        if (prevData) {
            return JSON.parse(prevData)
        }
        return DEFAULT_COLUMNS
    }
    const [columns, setColumns] = useState<ColumnType[]>(loadColumns)
    const [newColumnTitle, setNewColumnTitle] = useState("")
    const [newTaskTitle, setNewTaskTitle] = useState("")
    const [newTaskDescription, setNewTaskDescription] = useState("")
    const [activeTask, setActiveTask] = useState<TaskType | null>(null)
    const [preview, setPreview] = useState<{
        taskId: string
        position: "above" | "below"
    } | null>(null)
    useEffect(() => {
        localStorage.setItem("board-data", JSON.stringify(columns))
    }, [columns])
    // ====================
    // COLUMNS
    // ====================
    function addColumn() {
        if (!newColumnTitle.trim()) return

        const newColumn = {
            id : crypto.randomUUID(),
            title: newColumnTitle,
            tasks: []
        }

        setColumns([...columns, newColumn])
        setNewColumnTitle("")
    }  
    function updateColumnTitle(columnId: string, newTitle: string) {
        if (!newTitle.trim()) return

        const newColumns = columns.map(column => {
            if (column.id !== columnId) return column

            return {
                ...column,
                title: newTitle
            }
        })

        setColumns(newColumns)
    }
    function deleteColumn(index: number) {
        const newColumns = columns.filter((_, i) => i !== index)
        setColumns(newColumns)
    }
    // ====================
    // TASKS
    // ====================
    function addTask() {
        if (!newTaskTitle.trim()) return

        const newTask = {
            id : crypto.randomUUID(),
            title: newTaskTitle,
            description: newTaskDescription
        }

        const newColumns = [...columns]
        newColumns[0].tasks.push(newTask) // temporarely always on 'To Do' column

        setColumns(newColumns)
        setNewTaskTitle("")
        setNewTaskDescription("")
    }
    function updateTaskTitle( taskId: string, columnId: string, newTitle: string ) {
        const newColumns = columns.map((column) => {
            if (column.id !== columnId) return column

            return {
            ...column,
            tasks: column.tasks.map((task) =>
                task.id === taskId
                ? { ...task, title: newTitle }
                : task
            )
            }
        })

        setColumns(newColumns)
    }
    function updateTaskDescription( taskId: string, columnId: string, newDescription: string ) {
        const newColumns = columns.map((column) => {
            if (column.id !== columnId) return column

            return {
                ...column,
                tasks: column.tasks.map((task) => {
                    if (task.id === taskId) {
                        return { ...task, description: newDescription }
                    } else {
                        return task
                    }
                })
            }
        })

        setColumns(newColumns)
    }
    function deleteTask(taskId: string, columnId: string) {
        const newColumns = columns.map((column) => {
            if (column.id !== columnId) return column

            return {
            ...column,
            tasks: column.tasks.filter((t) => t.id !== taskId)
        }
    })

    setColumns(newColumns)
    }
    // ====================
    // TASKS MOVEMENT
    // ====================
    function moveTaskAdjacent(taskId: string, fromColumn: string, direction: "left" | "right") {
        const index = columns.findIndex(c => c.id === fromColumn)
        let targetIndex: number;
        if (direction === "left") {
            targetIndex = index - 1;
        } else {
            targetIndex = index + 1;
        }
        
        if (targetIndex < 0 || targetIndex >= columns.length) return

        const targetColumn = columns[targetIndex].id

        const newColumns = moveTaskToColumn(taskId, fromColumn, targetColumn, columns)
        setColumns(newColumns)
    }
    function handleMoveTask(taskId: string, fromColumn: string, toColumn: string) {
        const newColumns = moveTaskToColumn(
            taskId,
            fromColumn,
            toColumn,
            columns
        )
        setColumns(newColumns)
    }
    // ====================
    // COLUMNS MOVEMENT
    // ====================
    function moveColumnAdjacent(index: number, direction: "left" | "right") {
        const newColumns = [...columns]

        let targetIndex: number;
        if (direction === "left") {
            targetIndex = index - 1;
        } else {
            targetIndex = index + 1;
        }

        if (targetIndex < 0 || targetIndex >= columns.length) return

        const temp = newColumns[index]
        newColumns[index] = newColumns[targetIndex]
        newColumns[targetIndex] = temp

        setColumns(newColumns)
    }
    // ====================
    // DRAG & DROP
    // ====================
    function handleDragStart(event: any) {
        const task = event.active.data.current.task
        setActiveTask(task)
    }
    function handleDragEnd(event: any) {
        const { active, over } = event
        setActiveTask(null)
        
        if (!over) return

        const activeType = active.data.current?.type
        const overType = over.data.current?.type

        if (activeType === "column" && overType === "column") {
            const oldIndex = columns.findIndex(c => c.id === active.id)
            const newIndex = columns.findIndex(c => c.id === over.id)

            if (oldIndex !== newIndex) {
                setColumns(arrayMove(columns, oldIndex, newIndex))
            }
        } else {
            const taskId = active.id
            let targetColumnId: string = over.id
            let sourceColumnId: string = active.data.current.columnId

            if (!sourceColumnId) return

            const isTaskDrop = !!over.data.current?.columnId
            if (isTaskDrop) {
                targetColumnId = over.data.current.columnId
            }

            let newColumns: ColumnType[] = moveTaskToColumn(taskId, sourceColumnId, targetColumnId,columns)
            setColumns(newColumns)
            setPreview(null)
            if (isTaskDrop) {
                const newerColumns = reorderTask(active.id, over.id, newColumns)
                setColumns(newerColumns)
                return
            }
        }
    }
    function handleDragOver(event: any) {
        const { over } = event

        if (!over || !over.data.current?.columnId) {
            setPreview(null)
            return
        }

        const targetTaskId = over.id

        const rect = over.rect
        const middle = rect.top + rect.height / 2

        const mouseY = event.delta.y + rect.top 

        const position = mouseY < middle ? "above" : "below"

        setPreview({
            taskId: targetTaskId,
            position
        })
    }
    function renderOverlayTask() {
        if (!activeTask) return null
        return (
            <Task
                task={activeTask}
                isOverlay={true}
            />
        )
    }
    return (
        <DndContext 
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setPreview(null)}
        >
            <div 
                style={{ 
                    overflowX: "auto",
                    border: "2px solid gray",
                    padding: "10px",
             }}>
                <div 
                    style={{
                        display: "flex", 
                        gap: "20px"
                }}>
                    <SortableContext items={columns.map(col => col.id)} strategy={horizontalListSortingStrategy}>    
                        {columns.map((column, index) => (
                            <Column 
                                key={column.id} 
                                id={column.id}
                                tasks={column.tasks} 
                                title={column.title} 
                                width={300}
                                onDeleteTask={deleteTask}
                                onUpdateTaskTitle={updateTaskTitle}
                                onUpdateTaskDescription={updateTaskDescription}
                                taskPreview={preview}
                                onMoveTask={handleMoveTask}
                                onMoveTaskAdjacent={moveTaskAdjacent}
                                columnIndex={index}
                                totalColumns={columns.length}
                                onUpdateColumnTitle={updateColumnTitle}
                                onMoveColumnAdjacent={moveColumnAdjacent}
                                onDeleteColumn={deleteColumn}
                            />
                        ))}
                    </SortableContext>
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "10px"}}>
                <input
                    value={newTaskTitle}
                    onChange={(event) => setNewTaskTitle(event.target.value)}
                    placeholder="Enter task title"
                    style={{fontSize: "18px"}}
                />
                <input
                    value={newTaskDescription}
                    onChange={(event) => setNewTaskDescription(event.target.value)}
                    placeholder="Enter description"
                    style={{fontSize: "18px"}}
                />
                <button onClick={addTask} style = {{ marginBottom: "10px", minHeight: "44px", minWidth: "66px", fontSize: "18px"}}>Add Task</button>
            </div>
            <div style={{ display: "flex", gap: "10px", flexDirection: "column", padding: "10px"}}>
                <input
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="New column"
                    style={{fontSize: "18px"}}
                />
                <button onClick={addColumn} style={{minHeight: "44px", minWidth: "66px", fontSize: "18px"}}>Add Column</button>
            </div>
            <DragOverlay>
                {activeTask ? renderOverlayTask() : null}
            </DragOverlay>
        </DndContext>
    )
}



export default Board