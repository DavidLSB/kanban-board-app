import Column from "./Column"

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
                <Column key={column} title={column} width={300} />
            ))}
        </div>
    )
}

export default Board