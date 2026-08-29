import Column from "./Column"
import type { ColumnType } from "./Column"

interface BoardConflictViewProps {
    localColumns: ColumnType[]
    serverColumns: ColumnType[]
    localTotalColumnsCount: number
    serverTotalColumnsCount: number
    onLoadLocal: () => void
    onLoadServer: () => void
}

export default function BoardConflictView({
    localColumns,
    serverColumns,
    localTotalColumnsCount,
    serverTotalColumnsCount,
    onLoadLocal,
    onLoadServer
}: BoardConflictViewProps) {
    return (
        <div 
            style={{ 
                display: "flex",
                flexDirection: "column",
                padding: "20px",
                boxSizing: "border-box",
                backgroundColor: "#FFFFFF",
                color: "white",
                overflowY: "auto",
                alignItems: "center",
        }}>
            <h1 style={{ lineHeight: "1.4", marginBottom: "15px" }}>Local data differs from server data. Do you wish to load latest auto save or continue from server data?</h1>
            <p>Choose an option to resolve the data discrepancy.</p>
            <div
                style={{
                    display: "flex",
                    width: "95%",
                    border: "2px solid gray",
                    borderRadius: "8px",
                    padding: "16px",
                    gap: "20px",
                    justifyContent: "center",
            }}>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", border: "2px solid #6ba4ff", borderRadius: "8px", padding: "16px", color: "white", maxWidth: "50%", minWidth: "10px" }}>
                    <h2 style={{ marginBottom: "10px", color: "#080827" }}>Auto Save from local storage</h2>
                    <div style={{ marginBottom: "10px", fontSize: "16px", color: "white" }}>
                        <button onClick={onLoadLocal} style = {{ marginBottom: "10px", minHeight: "44px", minWidth: "66px", fontSize: "18px", cursor: "pointer"}}>Load Auto Save</button>
                    </div>
                    <div style={{ maxHeight: "750px", overflowX: "auto", overflowY: "auto", border: "1px solid #000000", borderRadius: "4px", padding: "10px", userSelect: "none"}}>
                        <div style={{ display: "flex", gap: "20px", color:"black", backgroundColor: "#d1d1d1", minHeight: "fit-content", minWidth: "fit-content",padding: "10px", borderRadius: "4px"}}>
                            {localColumns.map((column: ColumnType) => (
                                <div inert key={`${column.id}-div-1`}>
                                    <Column
                                        key={`${column.id}-1`}
                                        id={column.id}
                                        tasks={column.tasks} 
                                        title={column.title} 
                                        width={300}
                                        onDeleteTask={() => {}}
                                        onAddTask={() => {}}
                                        onUpdateTaskTitle={() => {}}
                                        onUpdateTaskDescription={() => {}}
                                        taskPreview={null}
                                        onMoveTaskAdjacent={() => {}}
                                        index={column.index}
                                        totalColumns={localTotalColumnsCount}
                                        onUpdateColumnTitle={() => {}}
                                        onMoveColumnAdjacent={() => {}}
                                        onDeleteColumn={() => {}}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", border: "2px solid #dd9c9c", borderRadius: "8px", padding: "16px", color: "white", maxWidth: "50%", minWidth: "10px" }}>
                    <h2 style={{ marginBottom: "10px", color: "#9e4b4b" }}>Last server sided save</h2>
                    <div style={{ marginBottom: "10px", fontSize: "16px", color: "white" }}>
                        <button onClick={onLoadServer} style = {{ marginBottom: "10px", minHeight: "44px", minWidth: "66px", fontSize: "18px", cursor: "pointer"}}>Load Server Data</button>
                    </div>
                    <div style={{ maxHeight: "750px", overflowX: "auto", overflowY: "auto", border: "1px solid #000000", borderRadius: "4px", padding: "10px", userSelect: "none"}}>
                        <div style={{ display: "flex", gap: "20px", color:"black", backgroundColor: "#d1d1d1", minHeight: "fit-content", minWidth: "fit-content",padding: "10px", borderRadius: "4px"}}>
                            {serverColumns.map((column: ColumnType) => (
                                <div inert key={`${column.id}-div-2`}>
                                    <Column
                                        key={`${column.id}-2`}
                                        id={column.id}
                                        tasks={column.tasks} 
                                        title={column.title} 
                                        width={300}
                                        onDeleteTask={() => {}}
                                        onAddTask={() => {}}
                                        onUpdateTaskTitle={() => {}}
                                        onUpdateTaskDescription={() => {}}
                                        taskPreview={null}
                                        onMoveTaskAdjacent={() => {}}
                                        index={column.index}
                                        totalColumns={serverTotalColumnsCount}
                                        onUpdateColumnTitle={() => {}}
                                        onMoveColumnAdjacent={() => {}}
                                        onDeleteColumn={() => {}}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}