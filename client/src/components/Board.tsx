import { useState } from "react"
import { DndContext, DragOverlay,  pointerWithin, TouchSensor, MouseSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query"
import Column from "./Column"
import type { ColumnType } from "./Column"
import type { Task as TaskType} from "./Task"
import Task from "./Task"
import { moveTaskToColumn, reorderTask, reindexColumns, reindexTasks, reorderTaskByIndex } from "./utils/BoardUtils"
import { readBoardAPI, overwriteBoardAPI } from "../api/board"
import { newColumnAPI, updateColumnAPI, deleteColumnAPI } from "../api/column"
import { newTaskAPI, updateTaskAPI, deleteTaskAPI } from "../api/task"

function Board() {
    const [isConflictSolved, setIsConflictSolved] = useState(false)
    const queryClient = useQueryClient()
    const query = useQuery({ queryKey: ["board-data"], queryFn: readBoardAPI,
        select: (serverData) => {
            const localData = localStorage.getItem("board-data")

            if (isConflictSolved) {
                return {...serverData, hasConflict: false}
            }
            if (serverData && localData) {
                try {
                    const localColumns = JSON.parse(localData)
                    const differs = JSON.stringify(localColumns) !== JSON.stringify(serverData.columns)
                    return {...serverData, hasConflict: differs}
                }
                catch {
                    return {...serverData, hasConflict: true}
                }
            }
            if (!serverData && !localData) {
                return {...serverData, hasConflict: false}
            }
            return {...serverData, hasConflict: true}
     }})
    function loadColumns(): ColumnType[] {
        const prevData = localStorage.getItem("board-data")
        if (prevData && prevData !== "undefined") {
            return JSON.parse(prevData)
        }
        return []
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
    function updateColumns(updater: ColumnType[] | ((prev: ColumnType[]) => ColumnType[])) {
        queryClient.setQueryData(["board-data"], (oldData: any) => {
            const currentColumns = oldData.columns || loadColumns()
            const nextColumns = typeof updater === "function" ? updater(currentColumns) : updater
            localStorage.setItem("board-data", JSON.stringify(nextColumns))
            return { ...(oldData || {}), columns: nextColumns }
        })
    }
    // ====================
    // MUTATIONS
    // ====================
    const overwriteBoardMutation = useMutation({ mutationFn: (variables: {title: string,columns: ColumnType[]}) => {
        const boardId = query?.data?.id
        if (!boardId) throw new Error("Board ID is not available")
        return overwriteBoardAPI({id: boardId, title: variables.title, columns: variables.columns})
    },
        onSuccess: (updatedServerData, _variables) => {
            queryClient.setQueryData(["board-data"], (oldData: any) => {
                return { ...oldData, ...updatedServerData, hasConflict: false }
            })
            localStorage.setItem("board-data", JSON.stringify(updatedServerData.columns))
            setIsConflictSolved(true)
        }
    })
    const createColumnMutation = useMutation({ mutationFn: (variables: {title: string, tempId: string}) => {
        const boardId = query?.data?.id
        if (!boardId) throw new Error("Board ID is not available")
        return newColumnAPI(boardId, variables.title)
    },
    onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: ["board-data"] })
        const previousData = queryClient.getQueryData(["board-data"])
        queryClient.setQueryData(["board-data"], (oldData: any) => {
            if (!oldData) return oldData
            const newColumns = [...oldData.columns, {
                id: variables.tempId,
                title: variables.title,
                index: oldData.columns.length,
                tasks: []
            }]
            localStorage.setItem("board-data", JSON.stringify(newColumns))
            return { ...oldData, columns: newColumns }
        })
        return { previousData }
    },
    onError: (_err, _variables, context) => {
        if (context?.previousData) {
            queryClient.setQueryData(["board-data"], context?.previousData)
        }
    },
    onSuccess: (savedColumn, variables) => {
        updateColumns(prevColumns => {
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
    },
    onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: ["board-data"] })
        const previousData = queryClient.getQueryData(["board-data"])
        queryClient.setQueryData(["board-data"], (oldData: any) => {
            if (!oldData) return oldData
            const newColumns = oldData.columns.map((column: ColumnType) => column.id === variables.columnId
                ? {
                    ...column,
                    ...(variables.newTitle !== undefined && { title: variables.newTitle }),
                    ...(variables.newIndex !== undefined && { index: variables.newIndex })
                }
                : column)
            return { ...oldData, columns: newColumns }
        })
        return { previousData }
    },
    onError: (_err, _variables, context) => {
        if (context?.previousData) queryClient.setQueryData(["board-data"], context.previousData)
    },
    onSuccess: (savedColumn, variables) => {
        updateColumns(columns => columns.map(column => column.id === variables.columnId
            ? { ...column, ...savedColumn }
            : column))
    }})
    const deleteColumnMutation = useMutation({ mutationFn: (variables: {columnId: string}) => {
        const boardId = query?.data?.id
        if (!boardId) throw new Error("Board ID is not available")
        return deleteColumnAPI(boardId, variables.columnId)
    },
    onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: ["board-data"] })
        const previousData = queryClient.getQueryData(["board-data"])
        queryClient.setQueryData(["board-data"], (oldData: any) => {
            if (!oldData) return oldData
            return { ...oldData, columns: reindexColumns(oldData.columns.filter((column: ColumnType) => column.id !== variables.columnId)) }
        })
        return { previousData }
    },
    onError: (_err, _variables, context) => {
        if (context?.previousData) queryClient.setQueryData(["board-data"], context.previousData)
    },
    onSuccess: (savedColumns, _variables) => {
        updateColumns(savedColumns)
    }})
    const createTaskMutation = useMutation({ mutationFn: (variables: {columnId: string, title: string, description: string, tempId: string}) => {
            const boardId = query?.data?.id
            if (!boardId) throw new Error("Board ID is not available")
            return newTaskAPI(boardId, variables.columnId, variables.title, variables.description)
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["board-data"] })
            const previousData = queryClient.getQueryData(["board-data"])
            queryClient.setQueryData(["board-data"], (oldData: any) => {
                if (!oldData) return oldData
                const newColumns = oldData.columns.map((column: ColumnType) => {
                    if (column.id !== variables.columnId) return column
                    const createdTask = {
                        id: variables.tempId,
                        title: variables.title,
                        description: variables.description,
                        index: column.tasks.length
                    }
                    return {
                        ...column,
                        tasks: [...column.tasks, createdTask]
                    }
                })

                localStorage.setItem("board-data", JSON.stringify(newColumns))
                return { ...oldData, columns: newColumns }
            })
            return { previousData }
        },
        onError: (_err, _variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(["board-data"], context?.previousData)
            }
        },
        onSuccess: (savedTask, variables) => {
            updateColumns(prevColumns => {
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
    },
    onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: ["board-data"] })
        const previousData = queryClient.getQueryData(["board-data"])
        queryClient.setQueryData(["board-data"], (oldData: any) => {
            if (!oldData) return oldData
            
            let currentColumns = [...oldData.columns]
            if (variables.newColumnId && variables.newColumnId !== variables.columnId) {
                currentColumns = moveTaskToColumn(variables.taskId, variables.columnId, variables.newColumnId, currentColumns)
            }
            const targetColumnId = variables.newColumnId || variables.columnId
            if (variables.newIndex !== undefined) {
                const [reorderedColumns] = reorderTaskByIndex(targetColumnId, variables.taskId, variables.newIndex, currentColumns)
                currentColumns = reorderedColumns
            }
            const finalColumns = currentColumns.map((column: ColumnType) => {
                if (column.id !== targetColumnId) return column

                return {
                    ...column,
                    tasks: reindexTasks(column.tasks.map(task => {
                        if (task.id !== variables.taskId) return task

                        return {
                            ...task,
                            ...(variables.newTitle !== undefined && { title: variables.newTitle }),
                            ...(variables.newDescription !== undefined && { description: variables.newDescription })
                        }
                    }))
                }
            })
            return { ...oldData, columns: finalColumns }
        })
        return { previousData }
    },
    onError: (_err, _variables, context) => {
        if (context?.previousData) queryClient.setQueryData(["board-data"], context.previousData)
    },
    onSuccess: (savedTask, variables) => {
        updateColumns(columns => columns.map(column => ({
            ...column,
            tasks: column.tasks.map(task => task.id === variables.taskId
                ? { ...task, ...savedTask }
                : task)
        })))
    }})
    const deleteTaskMutation = useMutation({ mutationFn: (variables: {columnId: string, taskId: string}) => {
        const boardId = query?.data?.id
        if (!boardId) throw new Error("Board ID is not available")
        return deleteTaskAPI(boardId, variables.columnId, variables.taskId)
    },
    onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: ["board-data"] })
        const previousData = queryClient.getQueryData(["board-data"])
        queryClient.setQueryData(["board-data"], (oldData: any) => {
            if (!oldData) return oldData
            const newColumns = oldData.columns.map((column: ColumnType) => column.id === variables.columnId
                ? { ...column, tasks: reindexTasks(column.tasks.filter(task => task.id !== variables.taskId)) }
                : column)
            return { ...oldData, columns: newColumns }
        })
        return { previousData }
    },
    onError: (_err, _variables, context) => {
        if (context?.previousData) queryClient.setQueryData(["board-data"], context.previousData)
    },
    onSuccess: (_savedTasks, variables) => {
        updateColumns(columns => columns.map(column => column.id === variables.columnId
            ? { ...column, tasks: reindexTasks(column.tasks.filter(task => task.id !== variables.taskId)) }
            : column))
    }})
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

        const newColumns = columns.map(column => {
            if (column.id !== columnId) return column

            return {
                ...column,
                title: newTitle
            }
        })
        updateColumnMutation.mutate({columnId, newTitle})
        updateColumns(newColumns)
    }
    function deleteColumn(columnId: string) {
        const filtered = columns.filter(column => column.id !== columnId)
        updateColumns(reindexColumns(filtered))
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
        updateColumns(newColumns)
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
        updateColumns(newColumns)
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
        updateColumns(newColumns)
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
        updateColumns(newColumns)
    }
    function handleMoveTask(taskId: string, fromColumn: string, toColumn: string) {
        const newColumns = moveTaskToColumn(
            taskId,
            fromColumn,
            toColumn,
            columns
        )
        updateColumns(newColumns)
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
        updateColumns(reIndexed)
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
                updateColumns(
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
            updateColumns(newColumns)
            setPreview(null)
            if (isTaskDrop) {
                const suffix = over.id.slice(-4)
                if (suffix === "-top") {
                    const [newerColumns, newTaskIndex] = reorderTask(active.id, over.data.current.taskId, "above", newColumns)
                    updateTaskMutation.mutate({ columnId: sourceColumnId, taskId, newIndex: newTaskIndex, newColumnId: targetColumnId })
                    updateColumns(newerColumns)
                    return
                } else {
                    const [newerColumns, newTaskIndex] = reorderTask(active.id, over.data.current.taskId, "below", newColumns)
                    updateTaskMutation.mutate({ columnId: sourceColumnId, taskId, newIndex: newTaskIndex, newColumnId: targetColumnId })
                    updateColumns(newerColumns)
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

        const serverColumns: ColumnType[] = serverData.columns
        updateColumns(serverColumns)
        setIsConflictSolved(true)
    }
    function loadLocalStorageData() {
        const localData = localStorage.getItem("board-data")
        if (!localData) return

        const localColumns: ColumnType[] = JSON.parse(localData)
        overwriteBoardMutation.mutate({title: query.data?.title || "My board", columns: localColumns})
    }
    if (query.isLoading) {
        return <div>Loading...</div>
    }
    if (query.data?.hasConflict && !isConflictSolved) {
        const localColumns = JSON.parse(localStorage.getItem("board-data") || "[]")
        const serverColumns = query.data?.columns || []
        return (
            <div 
                style={{ 
                    display: "flex",
                    flexDirection: "column",
                    padding: "20px",
                    boxSizing: "border-box",
                    backgroundColor: "#FFFFFF",
                    color: "white",
                    overflowY: "auto",
                    alignItems: "center",
             }}>
                <h1
                    style={{ lineHeight: "1.4", marginBottom: "15px" }}>Local data differs from server data. Do you wish to load latest auto save or continue from server data?</h1>
                <p>Choose an option to resolve the data discrepancy.</p>
                <div
                    style={{
                        display: "flex",
                        width: "95%",
                        border: "2px solid gray",
                        borderRadius: "8px",
                        padding: "16px",
                        gap: "20px",
                        justifyContent: "center",
                    }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", border: "2px solid #6ba4ff", borderRadius: "8px", padding: "16px", color: "white", maxWidth: "50%", minWidth: "10px" }}>
                            <h2 style={{ marginBottom: "10px", color: "#080827" }}>Auto Save from local storage</h2>
                            <div style={{ marginBottom: "10px", fontSize: "16px", color: "white" }}>
                                <button onClick={loadLocalStorageData} style = {{ marginBottom: "10px", minHeight: "44px", minWidth: "66px", fontSize: "18px", cursor: "pointer"}}>Load Auto Save</button>
                            </div>
                            <div style={{ maxHeight: "750px", overflowX: "auto", overflowY: "auto", border: "1px solid #000000", borderRadius: "4px", padding: "10px", userSelect: "none"}}>
                                <div style={{ display: "flex", gap: "20px", color:"black", backgroundColor: "#d1d1d1", minHeight: "fit-content", minWidth: "fit-content",padding: "10px", borderRadius: "4px"}}>
                                    {localColumns.map((column: ColumnType) => (
                                        <div inert>
                                            <Column
                                                key={column.id}
                                                id={column.id}
                                                tasks={column.tasks} 
                                                title={column.title} 
                                                width={300}
                                                onDeleteTask={() => {}}
                                                onAddTask={() => {}}
                                                onUpdateTaskTitle={() => {}}
                                                onUpdateTaskDescription={() => {}}
                                                taskPreview={null}
                                                onMoveTask={() => {}}
                                                onMoveTaskAdjacent={() => {}}
                                                index={column.index}
                                                totalColumns={columns.length}
                                                onUpdateColumnTitle={() => {}}
                                                onMoveColumnAdjacent={() => {}}
                                                onDeleteColumn={() => {}}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", border: "2px solid #dd9c9c", borderRadius: "8px", padding: "16px", color: "white", maxWidth: "50%", minWidth: "10px" }}>
                            <h2 style={{ marginBottom: "10px", color: "#9e4b4b" }}>Last server sized save</h2>
                            <div style={{ marginBottom: "10px", fontSize: "16px", color: "white" }}>
                                <button onClick={loadserverData} style = {{ marginBottom: "10px", minHeight: "44px", minWidth: "66px", fontSize: "18px", cursor: "pointer"}}>Load Server Data</button>
                            </div>
                            <div style={{ maxHeight: "750px", overflowX: "auto", overflowY: "auto", border: "1px solid #000000", borderRadius: "4px", padding: "10px", userSelect: "none"}}>
                                <div style={{ display: "flex", gap: "20px", color:"black", backgroundColor: "#d1d1d1", minHeight: "fit-content", minWidth: "fit-content",padding: "10px", borderRadius: "4px"}}>
                                    {serverColumns.map((column: ColumnType) => (
                                        <div inert>
                                            <Column
                                                key={column.id}
                                                id={column.id}
                                                tasks={column.tasks} 
                                                title={column.title} 
                                                width={300}
                                                onDeleteTask={() => {}}
                                                onAddTask={() => {}}
                                                onUpdateTaskTitle={() => {}}
                                                onUpdateTaskDescription={() => {}}
                                                taskPreview={null}
                                                onMoveTask={() => {}}
                                                onMoveTaskAdjacent={() => {}}
                                                index={column.index}
                                                totalColumns={columns.length}
                                                onUpdateColumnTitle={() => {}}
                                                onMoveColumnAdjacent={() => {}}
                                                onDeleteColumn={() => {}}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
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