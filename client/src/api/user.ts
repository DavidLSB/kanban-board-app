import type { UserType } from "../components/User"
const API_URL = import.meta.env.VITE_API_URL;

export async function createUserAPI(): Promise<UserType> {
    const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    })

    if (!response.ok) {
        throw new Error("Failed to create user")
    }

    return response.json();
}

export async function verifyUserAPI(userId: string): Promise<UserType> {
    const response = await fetch(`${API_URL}/users/${userId}`)
    if (!response.ok) {
        throw new Error("Failed to fetch user data")
    }
    return response.json()
}