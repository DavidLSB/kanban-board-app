type ColumnProps = {
    title: string
    width: number
    tasks: string[]
}

function Column({ title, width, tasks }: ColumnProps) {
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