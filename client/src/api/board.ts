const API_URL = import.meta.env.VITE_API_URL;

export async function readBoardAPI(){
    const response = await fetch(`${API_URL}/boards`)
    if (!response.ok) {
        throw new Error("Failed to fetch board data")
    }
    return response.json()
}