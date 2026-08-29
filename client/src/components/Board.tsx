import { useState } from "react"
import { DndContext, DragOverlay,  pointerWithin, TouchSensor, MouseSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { useQueryClient, useQuery } from "@tanstack/react-query"
import Column from "./Column"
import type { ColumnType } from "./Column"
import type { Task as TaskType} from "./Task"
import Task from "./Task"
import { moveTaskToColumn, reorderTask } from "./utils/BoardUtils"
import { readBoardAPI } from "../api/board"
import { useBoardMutations } from "../hooks/useBoardMutations"
import { processBoardDataComparison } from "./utils/BoardDataComparator"
import BoardConflictView from "./BoardConflictView"

type BoardDataType = {
    id: string
    title: string
    columns: ColumnType[]
    hasConflict: boolean
}

function Board() {
    const [isConflictSolved, setIsConflictSolved] = useState(false)
    const queryClient = useQueryClient()
    const query = useQuery({ queryKey: ["board-data"], queryFn: readBoardAPI,
        select: (serverData) => processBoardDataComparison(serverData, isConflictSolved)
    })
    function loadBoard() {
        const prevData = localStorage.getItem("board-data")
        if (prevData && prevData !== "undefined") {
            try {
                return JSON.parse(prevData)
            } catch(e) {
                console.error("Error parsing board data from localStorage", e)
            }
        }
        return null
    }
    function loadColumns(): ColumnType[] {
        const board = loadBoard()
        return board?.columns || []
    }
    const columns: ColumnType[] = query?.data?.columns || loadColumns()
    const [newColumnTitle, setNewColumnTitle] = useState("")
    const [activeTask, setActiveTask] = useState<TaskType | null>(null)
    const [preview, setPreview] = useState<{
            taskId: string
            position: "above" | "below"
        } | null>(null)
        const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
            delay: 150,
            tolerance: 5
            }
        })
    )
    function updateBoard(nextBoardData: BoardDataType) {
        localStorage.setItem("board-data", JSON.stringify(nextBoardData))
        queryClient.setQueryData(["board-data"], (oldData: any) => ({
            ...(oldData || {}),
            ...nextBoardData
        }))
    }
    function updateColumns(nextColumns: ColumnType[]) {
        const currentBoard: any = queryClient.getQueryData(["board-data"]) || loadBoard()
        if (!currentBoard) {
            console.error("No board data found to update columns")
            return
        }
        updateBoard({
            ...currentBoard,
            columns: nextColumns
        })
    }
    // ====================
    // MUTATIONS
    // ====================
    const {
        overwriteBoardMutation, 
        createColumnMutation, 
        updateColumnMutation, 
        deleteColumnMutation, 
        createTaskMutation, 
        updateTaskMutation, 
        deleteTaskMutation
    } = useBoardMutations({
        queryClient, 
        query, 
        loadBoard, 
        updateBoard, 
        updateColumns, 
        setIsConflictSolved
    })
    // ====================
    // COLUMNS
    // ====================
    function addColumn() {
        if (!newColumnTitle.trim()) return
        const tempId = crypto.randomUUID()
        createColumnMutation.mutate({title: newColumnTitle, tempId})
        setNewColumnTitle("")
    }  
    function updateColumnTitle(columnId: string, newTitle: string) {
        if (!newTitle.trim()) return
        updateColumnMutation.mutate({columnId, newTitle})
    }
    function deleteColumn(columnId: string) {
        deleteColumnMutation.mutate({columnId})
    }
    // ====================
    // TASKS
    // ====================
    function addTask(columnId: string, title: string, description: string) {
        if (!title.trim()) return
        const tempId = crypto.randomUUID()
        createTaskMutation.mutate({columnId, title, description, tempId})
    }
    function updateTaskTitle( taskId: string, columnId: string, newTitle: string ) {
        if (!newTitle.trim()) return
        updateTaskMutation.mutate({ columnId, taskId, newTitle })
    }
    function updateTaskDescription( taskId: string, columnId: string, newDescription: string ) {
        if (!newDescription.trim()) return
        updateTaskMutation.mutate({ columnId, taskId, newDescription })
    }
    function deleteTask(taskId: string, columnId: string) {
        deleteTaskMutation.mutate({ columnId, taskId })
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
        updateTaskMutation.mutate({ columnId: fromColumn, taskId, newColumnId: targetColumn })
    }
    // ====================
    // COLUMNS MOVEMENT
    // ====================
    function moveColumnAdjacent(columnId: string, direction: "left" | "right") {
        const newColumns = [...columns]

        const index = newColumns.findIndex(c => c.id === columnId)
        let targetIndex: number;
        if (direction === "left") {
            targetIndex = index - 1;
        } else {
            targetIndex = index + 1;
        }

        if (targetIndex < 0 || targetIndex >= columns.length) return

        updateColumnMutation.mutate({ columnId, newIndex: targetIndex })
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

        if (activeType === "column" && overType === "column" && active.id !== over.id) {
            const oldIndex = columns.findIndex(c => c.id === active.id)
            const newIndex = columns.findIndex(c => c.id === over.id)
            if (oldIndex !== newIndex) {
                updateColumnMutation.mutate({ columnId: active.id, newIndex })
            }
        } else {
            const taskId = active.id
            let targetColumnId: string = over.id
            let sourceColumnId: string = active.data.current.columnId

            if (!sourceColumnId) return

            const isTaskDrop = !!over.data.current?.columnId // "Did the user release the drop over a task's position?"
            if (isTaskDrop) {
                if (over.data.current.taskId === taskId) {
                    setPreview(null)
                    return
                }
                targetColumnId = over.data.current.columnId
            }

            let newColumns: ColumnType[] = moveTaskToColumn(taskId, sourceColumnId, targetColumnId,columns)
            setPreview(null)
            if (isTaskDrop) {
                const suffix = over.id.slice(-4)
                if (suffix === "-top") {
                    const [newerColumns, newTaskIndex] = reorderTask(active.id, over.data.current.taskId, "above", newColumns)
                    updateTaskMutation.mutate({ columnId: sourceColumnId, taskId, newIndex: newTaskIndex, newColumnId: targetColumnId, dragndropPrecalculatedColumns: newerColumns })
                    return
                } else {
                    const [newerColumns, newTaskIndex] = reorderTask(active.id, over.data.current.taskId, "below", newColumns)
                    updateTaskMutation.mutate({ columnId: sourceColumnId, taskId, newIndex: newTaskIndex, newColumnId: targetColumnId, dragndropPrecalculatedColumns: newerColumns })
                    return
                }
            } else {
                updateTaskMutation.mutate({ columnId: sourceColumnId, taskId, newColumnId: targetColumnId })
            }
        }
    }
    function handleDragOver(event: any) {
        const { over } = event
        if (!over){ 
            setPreview(null)
            return
        }
        const data = over.data.current
        if (!data || data.type !== "task-zone") {
            setPreview(null)
            return
        }

        setPreview({
            taskId: data.taskId,
            position: data.position
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
    // ====================
    // DATA SELECTION: AUTOSAVE VS SERVER
    // ====================
    function loadserverData() {
        const serverData = query?.data
        if (!serverData) return

        updateBoard(serverData)
        setIsConflictSolved(true)
    }
    function loadLocalStorageData() {
        const storedBoard = JSON.parse(localStorage.getItem("board-data") || "{}")
        if (!storedBoard) return

        const localColumns = storedBoard?.columns || []
        overwriteBoardMutation.mutate({title: query.data?.title || "My board", columns: localColumns})
    }
    if (query.isLoading) {
        return <div>Loading...</div>
    }
    if (query.data?.hasConflict && !isConflictSolved) {
        const storedBoard = JSON.parse(localStorage.getItem("board-data") || "{}")
        const localColumns = storedBoard?.columns || []
        const serverColumns = query.data?.columns || []
        console.log(JSON.stringify(serverColumns))
        console.log(JSON.stringify(query.data))
        return (
            <BoardConflictView
                localColumns={localColumns}
                serverColumns={serverColumns}
                localTotalColumnsCount={localColumns.length}
                serverTotalColumnsCount={serverColumns.length}
                onLoadLocal={loadLocalStorageData}
                onLoadServer={loadserverData}
            />
        )
    }
    return (
        <DndContext 
            sensors={sensors}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setPreview(null)}
            collisionDetection={pointerWithin}
        >
            <h1>{query.data?.hasConflict?.toString()}</h1>
            <h1>{query?.data?.title}</h1>
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
                        {columns.map((column) => (
                            <Column 
                                key={column.id} 
                                id={column.id}
                                tasks={column.tasks} 
                                title={column.title} 
                                width={300}
                                onDeleteTask={deleteTask}
                                onAddTask={addTask}
                                onUpdateTaskTitle={updateTaskTitle}
                                onUpdateTaskDescription={updateTaskDescription}
                                taskPreview={preview}
                                onMoveTaskAdjacent={moveTaskAdjacent}
                                index={column.index}
                                totalColumns={columns.length}
                                onUpdateColumnTitle={updateColumnTitle}
                                onMoveColumnAdjacent={moveColumnAdjacent}
                                onDeleteColumn={deleteColumn}
                            />
                        ))}
                    </SortableContext>
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
            </div>
            <DragOverlay>
                {activeTask ? renderOverlayTask() : null}
            </DragOverlay>
        </DndContext>
    )
}



export default Board