import { useState, useEffect } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createUserAPI, verifyUserAPI } from "../api/user"
import Board from "./Board"

export type UserType = {
    id: string
    boardsIds: string[]
    selectedBoardId: string
}

function User() {
    const [user, setUser] = useState<UserType | null>(() => {
        const stored = localStorage.getItem("user-data")
        if (stored) {
            try {
                return JSON.parse(stored)
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
            localStorage.setItem("user-data", JSON.stringify(newUser))
            setUser(newUser)
        },
        onError: (error) => {
            console.error("Failed to create user:", error)
        }
    })
    const { isLoading: isVerifying } = useQuery({
        queryKey: ["verifyUser", user?.id],
        queryFn: () => verifyUserAPI(user!.id),
        enabled: !!user,
        retry: false,
        meta: {
            onError: () => {
                localStorage.removeItem("user-data")
                setUser(null)
                console.error("Failed to verify user")
                createUserMutation.mutate()
            }
        }
    })
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