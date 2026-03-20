function Board() {
    const columns = ["To Do", "Doing", "Done"] //temporarely hard coded
    return (
        <div 
            style={{
            display: "flex", 
            gap: "20px", 
            border: "2px solid gray",
            padding: "10px",
            width: "1000px"
        }}>
            {columns.map((column) => (
                <div key={column} style={{
                    border: "1px solid gray",
                }}>
                    <h2>{column}</h2>
                </div>
            ))}
        </div>
    )
}

export default Board