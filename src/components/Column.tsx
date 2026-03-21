type ColumnProps = {
    title: string
    width: number
}

function Column({title, width}: ColumnProps) {
    const tasks = ["Task 1", "Task 2"] // hardcoded por ahora

    return (
        <div style={{
            border: "1px solid gray",
            width: `${width}px`,
            padding: "10px"
        }}>
            <h2>{title}</h2>

            {tasks.map((task) => (
                <div key={task} style={{
                    border: "1px solid black",
                    marginTop: "10px",
                    padding: "5px"
                }}>
                    {task}
                </div>
            ))}
        </div>
    )
}

export default Column