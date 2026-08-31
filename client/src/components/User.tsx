import { useState, useEffect } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createUserAPI, verifyUserAPI } from "../api/user"
import Board from "./Board"

const CURRENT_LOCAL_STORAGE_VERSION = 2

export type UserType = {
    id: string
    boardsIds: string[]
    selectedBoardId: string
    localStorageVersion: number
}

function User() {
    const [user, setUser] = useState<UserType | null>(() => {
        const stored = localStorage.getItem("user-data")
        if (stored) {
            try {
                const storedData = JSON.parse(stored)
                if (storedData.localStorageVersion === CURRENT_LOCAL_STORAGE_VERSION) {
                    return JSON.parse(stored)
                } else {
                    localStorage.removeItem("user-data")
                    localStorage.removeItem("board-data")
                    return null
                }
            } catch (error) {
                console.error("Failed to parse user data from localStorage:", error)
                localStorage.removeItem("user-data")
                return null
            }
        }    
        return null
    })
    const createUserMutation = useMutation({
        mutationFn: createUserAPI,
        onSuccess: (newUser) => {
            localStorage.setItem("user-data", JSON.stringify({...newUser, localStorageVersion: CURRENT_LOCAL_STORAGE_VERSION}))
            setUser(newUser)
        },
        onError: (error) => {
            console.error("Failed to create user:", error)
        }
    })
    const { isLoading: isVerifying, isError } = useQuery({
        queryKey: ["verifyUser", user?.id],
        queryFn: () => verifyUserAPI(user!.id),
        enabled: !!user,
        retry: false
    })
    useEffect(() => {
        if (isError) {
            localStorage.removeItem("user-data")
            setUser(null)
            console.error("Failed to verify user")
            createUserMutation.mutate()
        }
    }, [isError])
    useEffect(() => {
        if (!user && !isVerifying && !createUserMutation.isPending && !createUserMutation.isSuccess) {
            createUserMutation.mutate()
        }
    }, [user, createUserMutation, isVerifying])
    if (!user || isVerifying || createUserMutation.isPending) {
        return <div>Loading...</div>
    }
    return (
        <Board userId={user.id} boardId={user.selectedBoardId}/>
    )
}

export default User