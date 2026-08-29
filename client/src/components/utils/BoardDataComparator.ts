export function processBoardDataComparison(serverData: any, isConflictSolved: boolean) {
    const localData = localStorage.getItem("board-data")
    
    if (isConflictSolved) {
        return {...serverData, hasConflict: false}
    }
    if (serverData && localData) {
        try {
            const localBoard = JSON.parse(localData)
            const localComparisonTarget = {
                id: localBoard.id,
                title: localBoard.title,
                columns: localBoard.columns
            }
            const serverComparisonTarget = {
                id: serverData.id,
                title: serverData.title,
                columns: serverData.columns
            }
            const differs = JSON.stringify(localComparisonTarget) !== JSON.stringify(serverComparisonTarget)
                return {...serverData, hasConflict: differs}
        } catch {
            return {...serverData, hasConflict: true}
        }
    }
    if (!serverData && !localData) {
        return {...serverData, hasConflict: false}
    }
    return {...serverData, hasConflict: true}
}