const API_URL = import.meta.env.VITE_API_URL;

export async function readBoardAPI(variables: {userId: string, boardId: string}) {
    const response = await fetch(`${API_URL}/users/${variables.userId}/boards/${variables.boardId}`)
    if (!response.ok) {
        throw new Error("Failed to fetch board data")
    }
    return response.json()
}

export async function overwriteBoardAPI(variables: {userId: string,id: string, title: string, columns: any[]}) {
    const response = await fetch(`${API_URL}/users/${variables.userId}/boards/${variables.id}/overwrite`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({title: variables.title, columns: variables.columns}),
    })
    if (!response.ok) {
        throw new Error("Failed to overwrite board data")
    }
    return response.json()
}