import type { ColumnType } from "../components/Column"
const API_URL = import.meta.env.VITE_API_URL;

export async function newColumnAPI(boardId: string, title: string): Promise<ColumnType> {
    const response = await fetch(`${API_URL}/boards/${boardId}/columns`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
    });

    if (!response.ok) {
        throw new Error("Failed to create column");
    }

    return response.json();
}

export async function updateColumnAPI(boardId: string, columnId: string, newTitle?: string, newIndex?: number): Promise<ColumnType> {
    const body: Record<string, any> = {};
    if (newTitle !== undefined) body.title = newTitle;
    if (newIndex !== undefined) body.index = newIndex;
    const response = await fetch(`${API_URL}/boards/${boardId}/columns/${columnId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    
    if (!response.ok) {
        throw new Error("Failed to update column");
    }
    return response.json();
}

export async function deleteColumnAPI(boardId: string, columnId: string): Promise<ColumnType[]> {
    const response = await fetch(`${API_URL}/boards/${boardId}/columns/${columnId}`, {
        method: "DELETE",
    });
    
    if (!response.ok) {
        throw new Error("Failed to delete column");
    }
    return response.json();
}