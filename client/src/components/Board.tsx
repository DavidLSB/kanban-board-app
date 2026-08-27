import { useState, useEffect } from "react"
import { DndContext, DragOverlay,  pointerWithin, TouchSensor, MouseSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useQuery, useMutation } from "@tanstack/react-query"
import Column from "./Column"
import type { ColumnType } from "./Column"
import type { Task as TaskType} from "./Task"
import Task from "./Task"
import { moveTaskToColumn, reorderTask, reindexColumns, reindexTasks } from "./utils/BoardUtils"
import { readBoardAPI } from "../api/board"
import { newColumnAPI, updateColumnAPI, deleteColumnAPI } from "../api/column"
import { newTaskAPI, updateTaskAPI, deleteTaskAPI } from "../api/task"

const DEFAULT_COLUMNS: ColumnType[] = [{
        id : crypto.randomUUID(),
        title: "To Do",
        tasks: [
            { id: crypto.randomUUID(), title: "Task 1", description: "", index: 0 },
            { id: crypto.randomUUID(), title: "Task 2", description: "", index: 1 }
        ],
        index: 0
    },
    {
        id : crypto.randomUUID(),
        title: "Doing",
        tasks: [
            { id: crypto.randomUUID(), title: "Task 3", description: "", index: 0 }
        ],
        index: 1
    },
    {
        id : crypto.randomUUID(),
        title: "Done",
        tasks: [],
        index: 2
    }
]

function Board() {
    //const queryClient = useQueryClient() for board metadata editing, not implemented yet.
    const query = useQuery({ queryKey: ["board-data"], queryFn: readBoardAPI })
    const createColumnMutation = useMutation({ mutationFn: (variables: {title: string, tempId: string}) => {
        const boardId = query?.data?.id
        if (!boardId) throw new Error("Board ID is not available")
        return newColumnAPI(boardId, variables.title)
    },
    onSuccess: (savedColumn, variables) => {
        setColumns(prevColumns => {
            const newColumns = prevColumns.map(column => {
                if (column.id === variables.tempId) {
                    return {...column, id: savedColumn.id}
                } else {
                    return column
                }
            })

            return newColumns
        })
    }})
    const updateColumnMutation = useMutation({ mutationFn: (variables: {columnId: string, newTitle?: string, newIndex?: number}) => {
        const boardId = query?.data?.id
        if (!boardId) throw new Error("Board ID is not available")
        return updateColumnAPI(boardId, variables.columnId, variables.newTitle, variables.newIndex)
    }})
    const deleteColumnMutation = useMutation({ mutationFn: (variables: {columnId: string}) => {
        const boardId = query?.data?.id
        if (!boardId) throw new Error("Board ID is not available")
        return deleteColumnAPI(boardId, variables.columnId)
    }})
    const createTaskMutation = useMutation({ mutationFn: (variables: {columnId: string, title: string, description: string, tempId: string}) => {
        const boardId = query?.data?.id
        if (!boardId) throw new Error("Board ID is not available")
        return newTaskAPI(boardId, variables.columnId, variables.title, variables.description)
    },
    onSuccess: (savedTask, variables) => {
        setColumns(prevColumns => {
            const newColumns = prevColumns.map(column => {
                if (column.id !== variables.columnId) return column

                return {
                    ...column,
                    tasks: column.tasks.map(task => {
                        if (task.id === variables.tempId) {
                            return {...task, id: savedTask.id}
                        } else {
                            return task
                        }
                    })
                }
            })

            return newColumns
        })
    }})
    const updateTaskMutation = useMutation({ mutationFn: (variables: {columnId: string, taskId: string, newTitle?: string, newDescription?: string, newIndex?: number, newColumnId?: string}) => {
        const boardId = query?.data?.id
        if (!boardId) throw new Error("Board ID is not available")
        return updateTaskAPI(boardId, variables.columnId, variables.taskId, variables.newTitle, variables.newDescription, variables.newIndex, variables.newColumnId)
    }})
    const deleteTaskMutation = useMutation({ mutationFn: (variables: {columnId: string, taskId: string}) => {
        const boardId = query?.data?.id
        if (!boardId) throw new Error("Board ID is not available")
        return deleteTaskAPI(boardId, variables.columnId, variables.taskId)
    }})
    function loadColumns(): ColumnType[] {
        const prevData = localStorage.getItem("board-data")
        if (prevData) {
            return JSON.parse(prevData)
        }
        return DEFAULT_COLUMNS
    }
    const [isConflictSolved, setIsConflictSolved] = useState(false)
    const [columns, setColumns] = useState<ColumnType[]>(loadColumns)
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
    useEffect(() => {
        localStorage.setItem("board-data", JSON.stringify(columns))
    }, [columns])
    // ====================
    // COLUMNS
    // ====================
    function addColumn() {
        if (!newColumnTitle.trim()) return
        const createdColumn = {
            id: crypto.randomUUID(),
            title: newColumnTitle,
            tasks: [],
            index: columns.length
        }
        setColumns(prevColumns => [...prevColumns, createdColumn])
        createColumnMutation.mutate({title: newColumnTitle, tempId: createdColumn.id})
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
        updateColumnMutation.mutate({columnId, newTitle})
        setColumns(newColumns)
    }
    function deleteColumn(columnId: string) {
        const filtered = columns.filter(column => column.id !== columnId)
        setColumns(reindexColumns(filtered))
        deleteColumnMutation.mutate({columnId})
    }
    // ====================
    // TASKS
    // ====================
    function addTask(columnId: string, title: string, description: string) {
        if (!title.trim()) return

        const createdTask = {
            id: crypto.randomUUID(),
            title,
            description,
            index: columns.find(c => c.id === columnId)?.tasks.length || 0
        }
        
        const newColumns = columns.map(column => {
            if (column.id !== columnId) return column

            

            return {
                ...column,
                tasks: [...column.tasks, createdTask]
            }
        })
        setColumns(newColumns)
        createTaskMutation.mutate({columnId, title, description, tempId: createdTask.id})
    }
    function updateTaskTitle( taskId: string, columnId: string, newTitle: string ) {
        let taskDescription = ""
        const newColumns = columns.map((column) => {
            if (column.id !== columnId) return column

            return {
            ...column,
            tasks: column.tasks.map((task) => {
                if (task.id === taskId) {
                    taskDescription = task.description
                    return { ...task, title: newTitle }
                } else {
                    return task
                }
            })
            }
        })

        updateTaskMutation.mutate({ columnId, taskId, newTitle, newDescription: taskDescription })
        setColumns(newColumns)
    }
    function updateTaskDescription( taskId: string, columnId: string, newDescription: string ) {
        let taskTitle = ""
        const newColumns = columns.map((column) => {
            if (column.id !== columnId) return column

            return {
                ...column,
                tasks: column.tasks.map((task) => {
                    if (task.id === taskId) {
                        taskTitle = task.title
                        return { ...task, description: newDescription }
                    } else {
                        return task
                    }
                })
            }
        })

        updateTaskMutation.mutate({ columnId, taskId, newTitle: taskTitle, newDescription })
        setColumns(newColumns)
    }
    function deleteTask(taskId: string, columnId: string) {
        const newColumns = columns.map(column => {
            if (column.id !== columnId) return column

            const filtered = column.tasks.filter(t => t.id !== taskId)

            return {
                ...column,
                tasks: reindexTasks(filtered)
            }
        })

        deleteTaskMutation.mutate({ columnId, taskId })
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
        updateTaskMutation.mutate({ columnId: fromColumn, taskId, newColumnId: targetColumn })
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

        const temp = newColumns[index]
        newColumns[index] = newColumns[targetIndex]
        newColumns[targetIndex] = temp

        const reIndexed = reindexColumns(newColumns)

        updateColumnMutation.mutate({ columnId, newIndex: targetIndex })
        setColumns(reIndexed)
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
                const moved = arrayMove(columns, oldIndex, newIndex)

                updateColumnMutation.mutate({ columnId: active.id, newIndex })
                setColumns(
                    reindexColumns(moved)
                )
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
            setColumns(newColumns)
            setPreview(null)
            if (isTaskDrop) {
                const suffix = over.id.slice(-4)
                if (suffix === "-top") {
                    const [newerColumns, newTaskIndex] = reorderTask(active.id, over.data.current.taskId, "above", newColumns)
                    updateTaskMutation.mutate({ columnId: sourceColumnId, taskId, newIndex: newTaskIndex, newColumnId: targetColumnId })
                    setColumns(newerColumns)
                    return
                } else {
                    const [newerColumns, newTaskIndex] = reorderTask(active.id, over.data.current.taskId, "below", newColumns)
                    updateTaskMutation.mutate({ columnId: sourceColumnId, taskId, newIndex: newTaskIndex, newColumnId: targetColumnId })
                    setColumns(newerColumns)
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
    function localStorageDiffersFromServerData(): boolean {
        if (isConflictSolved) return false
        const localData = localStorage.getItem("board-data")
        const serverData = query?.data
        if (serverData && localData) {
            const localColumns: ColumnType[] = JSON.parse(localData)
            const serverColumns: ColumnType[] = serverData.columns
            return JSON.stringify(localColumns) !== JSON.stringify(serverColumns)
        }
        if (!serverData && !localData) return false
        return true
    }
    function loadserverData() {
        const serverData = query?.data
        if (!serverData) return

        const serverColumns: ColumnType[] = serverData.columns
        setColumns(serverColumns)
        setIsConflictSolved(true)
    }
    function loadLocalStorageData() {
        const localData = localStorage.getItem("board-data")
        if (!localData) return

        const localColumns: ColumnType[] = JSON.parse(localData)
        //make the server board match the local board, for now just set the columns to the local columns
        setColumns(localColumns)
        setIsConflictSolved(true)
    }
    if (query.isLoading) {
        return <div>Loading...</div>
    }
    if (localStorageDiffersFromServerData()) {
        return (
            <div 
                style={{ 
                    overflowX: "auto",
                    border: "2px solid gray",
                    padding: "1px"
             }}>
                <h1
                    style={{ lineHeight: "1.4", marginBottom: "15px" }}>Local data differs from server data. Do you wish to load latest auto save or continue from server data?</h1>
                <p>Choose an option to resolve the data discrepancy.</p>
                <div
                    style={{
                        display: "flex", 
                        gap: "20px",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "20px"
                    }}>
                    <button onClick={loadLocalStorageData} style = {{ marginBottom: "10px", minHeight: "44px", minWidth: "66px", fontSize: "18px"}}>Load Auto Save</button>
                    <button onClick={loadserverData} style = {{ marginBottom: "10px", minHeight: "44px", minWidth: "66px", fontSize: "18px"}}>Load Server Data</button>
                </div>
             </div>
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
            <h1>{localStorageDiffersFromServerData().toString()}</h1>
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
                                onMoveTask={handleMoveTask}
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