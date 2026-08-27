import type { Task as TaskType } from "../components/Task"
const API_URL = import.meta.env.VITE_API_URL;

export async function newTaskAPI(boardId: string, columnId: string, title: string, description: string): Promise<TaskType> {
    const response = await fetch(`${API_URL}/boards/${boardId}/columns/${columnId}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
    });

    if (!response.ok) {
        throw new Error("Failed to create task");
    }

    return response.json();
}

export async function updateTaskAPI(boardId: string, columnId: string, taskId: string, newTitle?: string, newDescription?: string, newIndex?: number, newColumnId?: string): Promise<TaskType> {
    const body: Record<string, any> = {};
    if (newTitle !== undefined) body.title = newTitle;
    if (newDescription !== undefined) body.description = newDescription;
    if (newIndex !== undefined) body.index = newIndex;
    if (newColumnId !== undefined) body.newColumnId = newColumnId;
    const response = await fetch(`${API_URL}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error("Failed to update task");
    }
    return response.json();
}

export async function deleteTaskAPI(boardId: string, columnId: string, taskId: string): Promise<TaskType[]> {
    const response = await fetch(`${API_URL}/boards/${boardId}/columns/${columnId}/tasks/${taskId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error("Failed to delete task");
    }

    return response.json();
}