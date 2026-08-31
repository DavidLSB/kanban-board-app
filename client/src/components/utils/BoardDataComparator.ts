function onlyIdsDiffer(localData:any, serverData:any) {
    if (!localData || !serverData) {
        return false
    }
    if (localData.title !== serverData.title) return false
    if (localData.columns.length !== serverData.columns.length) return false
    for (let i = 0; i < localData.columns.length; i++) {
        if (localData.columns[i].title !== serverData.columns[i].title) return false
        if (localData.columns[i].tasks.length !== serverData.columns[i].tasks.length) return false
        for (let j = 0; j < localData.columns[i].tasks.length; j++) {
            if (localData.columns[i].tasks[j].title !== serverData.columns[i].tasks[j].title) return false
            if (localData.columns[i].tasks[j].description !== serverData.columns[i].tasks[j].description) return false
        }
    }
    return true
}

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
            if (!onlyIdsDiffer(localComparisonTarget, serverComparisonTarget)) {
                return {...serverData, hasConflict: differs}
            } else {
                localStorage.setItem("board-data", JSON.stringify(serverData))
                return {...serverData, hasConflict: false}
            }
        } catch {
            return {...serverData, hasConflict: true}
        }
    }
    if (!serverData && !localData) {
        return {...serverData, hasConflict: false}
    }
    if (serverData && !localData) {
        localStorage.setItem("board-data", JSON.stringify(serverData))
        return {...serverData, hasConflict: false}
    }
    return {...serverData, hasConflict: true}
}