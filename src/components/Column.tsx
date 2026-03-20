type ColumnProps = {
    title: string
    width: number
}

function Column({title, width}: ColumnProps) {
    return (
        <div style={{
            border: "1px solid gray",
            width: `${width}px`
        }}>
            <h2>{title}</h2>
        </div>
    )
}

export default Column