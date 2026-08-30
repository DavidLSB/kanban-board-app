import { useMutation, useQueryClient } from "@tanstack/react-query"
import { overwriteBoardAPI } from "../api/board"
import { newColumnAPI, updateColumnAPI, deleteColumnAPI } from "../api/column"
import { newTaskAPI, updateTaskAPI, deleteTaskAPI } from "../api/task"
import { arrayMove } from '@dnd-kit/sortable'
import type { ColumnType } from "../components/Column"
import type { Task as TaskType } from "../components/Task"
import { moveTaskToColumn, reindexColumns, reindexTasks, reorderTaskByIndex } from "../components/utils/BoardUtils"

type BoardDataType = {
    id: string
    title: string
    columns: ColumnType[]
    hasConflict: boolean
}

interface UseBoardMutationsProps {
    queryClient: ReturnType<typeof useQueryClient>
    query: any
    loadBoard: () => any
    updateBoard: (nextBoardData: BoardDataType) => void
    updateColumns: (nextColumns: ColumnType[]) => void
    setIsConflictSolved: (solved: boolean) => void
}

export function useBoardMutations({
    queryClient,
    query,
    loadBoard,
    updateBoard,
    updateColumns,
    setIsConflictSolved,
}: UseBoardMutationsProps) {
    const overwriteBoardMutation = useMutation({ mutationFn: (variables: {userId: string, title: string,columns: ColumnType[]}) => {
            const boardId = query?.data?.id
            if (!boardId) throw new Error("Board ID is not available")
            return overwriteBoardAPI({userId: variables.userId, id: boardId, title: variables.title, columns: variables.columns})
        },
        onSuccess: (updatedServerData, _variables) => {
            updateBoard({
                ...updatedServerData, 
                hasConflict: false
            })
            setIsConflictSolved(true)
        }
    })
    const createColumnMutation = useMutation({ mutationFn: (variables: {userId: string, title: string, tempId: string}) => {
            const boardId = query?.data?.id
            if (!boardId) throw new Error("Board ID is not available")
            return newColumnAPI(variables.userId, boardId, variables.title)
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["board-data"] })
            const previousData: any = queryClient.getQueryData(["board-data"]) || loadBoard()
            if (!previousData) {
                console.error("No board data found to create column")
                return
            }
            const currentColumns = previousData?.columns || []
            const newColumns = [
                ...currentColumns,
                {
                    id: variables.tempId,
                    title: variables.title,
                    index: currentColumns.length,
                    tasks: []
                }
            ]
            updateColumns(newColumns)
            return { previousData }
        },
        onError: (_err, _variables, context) => {
            if (context?.previousData) {
                updateBoard(context.previousData as BoardDataType)
            }
        },
        onSuccess: (savedColumn, variables) => {
            const currentBoard: any = queryClient.getQueryData(["board-data"]) || loadBoard()
            if (!currentBoard) {
                console.error("No board data found to receive created column")
                return
            }
            const currentColumns = currentBoard?.columns || []
            const newColumns = currentColumns.map((column: ColumnType) => 
                column.id === variables.tempId ? { ...column, id: savedColumn.id } : column
            )
            updateColumns(newColumns)
        }
    })
    const updateColumnMutation = useMutation({ mutationFn: (variables: {userId: string, columnId: string, newTitle?: string, newIndex?: number}) => {
            const boardId = query?.data?.id
            if (!boardId) throw new Error("Board ID is not available")
            return updateColumnAPI(variables.userId, boardId, variables.columnId, variables.newTitle, variables.newIndex)
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["board-data"] })
            const previousData: any = queryClient.getQueryData(["board-data"]) || loadBoard()
            if (!previousData) {
                console.error("No board data found to update column")
                return
            }
            let newColumns = [...previousData.columns]
            if (variables.newTitle !== undefined) {
                newColumns = newColumns.map((column: ColumnType) => column.id === variables.columnId
                    ? { ...column, title: variables.newTitle }
                    : column)
            }
            if (variables.newIndex !== undefined) {
                const oldIndex = newColumns.findIndex(c => c.id === variables.columnId)
                if (oldIndex !== -1) {
                    newColumns = reindexColumns(arrayMove(newColumns, oldIndex, variables.newIndex))
                } else {
                    console.error(`Column with ID ${variables.columnId} not found for reordering.`)
                    console.error(`Previoius data was ${JSON.stringify(newColumns)}`)
                }
            }
            updateColumns(newColumns)
            return { previousData }
        },
        onError: (_err, _variables, context) => {
            if (context?.previousData) {
                updateBoard(context.previousData as BoardDataType)
            }
        },
        onSuccess: (savedColumn, variables) => {
            const currentBoard: any = queryClient.getQueryData(["board-data"]) || loadBoard()

            if (!currentBoard) {
                console.log("No board data found to receive updated column")
                return
            }
            const currentColumns = currentBoard?.columns || []
            const newColumns = currentColumns.map((column: ColumnType) => column.id === variables.columnId
                ? { ...column, ...savedColumn }
                : column)
            updateColumns(newColumns)
        }
    })
    const deleteColumnMutation = useMutation({ mutationFn: (variables: {userId: string, columnId: string}) => {
            const boardId = query?.data?.id
            if (!boardId) throw new Error("Board ID is not available")
            return deleteColumnAPI(variables.userId, boardId, variables.columnId)
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["board-data"] })
            const previousData: any = queryClient.getQueryData(["board-data"]) || loadBoard()
            if (!previousData) {
                console.log("No board data found to delete column")
                return
            }
            const currentColumns = previousData?.columns || []
            const newColumns = reindexColumns(currentColumns.filter((column: ColumnType) => column.id !== variables.columnId))
            updateColumns(newColumns)
            return { previousData }
        },
        onError: (_err, _variables, context) => {
            if (context?.previousData) {
                updateBoard(context.previousData as BoardDataType)
            }
        },
        onSuccess: (savedColumns, _variables) => {
            if (savedColumns) {
                updateColumns(savedColumns)
            } else {
                console.error("No columns data returned from server after deletion.")
            }
        }
    })
    const createTaskMutation = useMutation({ mutationFn: (variables: {userId: string, columnId: string, title: string, description: string, tempId: string}) => {
            const boardId = query?.data?.id
            if (!boardId) throw new Error("Board ID is not available")
            return newTaskAPI(variables.userId, boardId, variables.columnId, variables.title, variables.description)
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["board-data"] })
            const previousData: any = queryClient.getQueryData(["board-data"]) || loadBoard()
            if (!previousData) {
                console.log("No board data found to create task")
                return
            }

            const currentColumns = previousData.columns || []
            const newColumns = currentColumns.map((column: ColumnType) => {
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
            updateColumns(newColumns)
            return { previousData }
        },
        onError: (_err, _variables, context) => {
            if (context?.previousData) {
                updateBoard(context.previousData as BoardDataType)
            }
        },
        onSuccess: (savedTask, variables) => {
            const currentBoard: any = queryClient.getQueryData(["board-data"]) || loadBoard()
            if (!currentBoard) {
                console.log("No board data found to receive created task")
                return
            }
            const currentColumns = currentBoard?.columns || []
            const newColumns = currentColumns.map((column: ColumnType) => {
                if (column.id !== variables.columnId) return column
                return {
                    ...column,
                    tasks: column.tasks.map((task: TaskType) => {
                        if (task.id === variables.tempId) {
                            return { ...task, ...savedTask }
                        } else {
                            return task
                        }
                    })
                }
            }) 
            updateColumns(newColumns)
        }
    })
    const updateTaskMutation = useMutation({ mutationFn: (variables: {userId: string, columnId: string, taskId: string, newTitle?: string, newDescription?: string, newIndex?: number, newColumnId?: string, dragndropPrecalculatedColumns?: ColumnType[]}) => {
            const boardId = query?.data?.id
            if (!boardId) throw new Error("Board ID is not available")
            return updateTaskAPI(variables.userId, boardId, variables.columnId, variables.taskId, variables.newTitle, variables.newDescription, variables.newIndex, variables.newColumnId)
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["board-data"] })
            const previousData: any = queryClient.getQueryData(["board-data"]) || loadBoard()
            if (!previousData) {
                console.error("No board data found to update task")
                return
            }
            const currentColumns = previousData.columns || []
            let newColumns = [...currentColumns]
            if (variables.newColumnId && variables.newColumnId !== variables.columnId) {
                newColumns = moveTaskToColumn(variables.taskId, variables.columnId, variables.newColumnId, newColumns)
            }
            const targetColumnId = variables.newColumnId || variables.columnId
            if (variables.newIndex !== undefined && variables.dragndropPrecalculatedColumns === undefined) {
                const [reorderedColumns] = reorderTaskByIndex(targetColumnId, variables.taskId, variables.newIndex, newColumns)
                newColumns = reorderedColumns
            }
            if (variables.dragndropPrecalculatedColumns !== undefined) {
                newColumns = variables.dragndropPrecalculatedColumns
            }
            const finalColumns = newColumns.map((column: ColumnType) => {
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
            updateColumns(finalColumns)
            return { previousData }
        },
        onError: (_err, _variables, context) => {
            if (context?.previousData) {
                updateBoard(context.previousData as BoardDataType)
            }
        },
        onSuccess: (savedTask, variables) => {
            const currentBoard: any = queryClient.getQueryData(["board-data"]) || loadBoard()
            if (!currentBoard) {
                console.log("No board data found to receive updated task")
                return
            }
            const currentColumns = currentBoard.columns || []
            const targetColumnId = variables.newColumnId || variables.columnId
            const newColumns = currentColumns.map((column: ColumnType) => {
                if (column.id !== targetColumnId) return column
                return {
                    ...column,
                    tasks: column.tasks.map((task: TaskType) => 
                        task.id === variables.taskId
                            ? { ...task, ...savedTask }
                            : task)
                }
            })
            updateColumns(newColumns)
        }
    })
    const deleteTaskMutation = useMutation({ mutationFn: (variables: {userId: string, columnId: string, taskId: string}) => {
            const boardId = query?.data?.id
            if (!boardId) throw new Error("Board ID is not available")
            return deleteTaskAPI(variables.userId, boardId, variables.columnId, variables.taskId)
        },
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["board-data"] })
            const previousData: any = queryClient.getQueryData(["board-data"]) || loadBoard()
            if (!previousData) {
                console.error("No board data found to delete task")
                return
            }
            const currentColumns = previousData.columns || []
            const newColumns = currentColumns.map((column: ColumnType) => column.id === variables.columnId
                ? { ...column, tasks: reindexTasks(column.tasks.filter((task: TaskType)=> task.id !== variables.taskId)) }
                : column)
            updateColumns(newColumns)
            return { previousData }
        },
        onError: (_err, _variables, context) => {
            if (context?.previousData) {
                updateBoard(context.previousData as BoardDataType)
            }
        },
        onSuccess: (savedTasks, variables) => {
            const currentBoard: any = queryClient.getQueryData(["board-data"]) || loadBoard()
            if (!currentBoard) {
                console.error("No board data found to receive deleted task")
                return
            }
            const currentColumns = currentBoard.columns || []
            const newColumns = currentColumns.map((column: ColumnType) => column.id === variables.columnId
                ? { ...column, tasks: reindexTasks(savedTasks) }
                : column)
            updateColumns(newColumns)
        }
    })

    return {
        overwriteBoardMutation,
        createColumnMutation,
        updateColumnMutation,
        deleteColumnMutation,
        createTaskMutation,
        updateTaskMutation,
        deleteTaskMutation
    }
}