import Column from "./Column"

function Board() {
    const columns = [
    {
        title: "To Do",
        tasks: ["Task A", "Task B"]
    },
    {
        title: "Doing",
        tasks: ["Task C"]
    },
    {
        title: "Done",
        tasks: []
    }
    ] //temporarely hard coded
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
                <Column tasks={column.tasks} key={column.title} title={column.title} width={300} />
            ))}
        </div>
    )
}

export default Board