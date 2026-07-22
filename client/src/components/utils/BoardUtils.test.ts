import { test, expect } from "vitest"
import { moveTaskToColumn } from "./BoardUtils"
import { reorderTask } from "./BoardUtils"

test("moves a task between columns", () => {
    const columns = [
        {
            id: "todo",
            title: "To Do",
            tasks: [
                {
                    id: "task1",
                    title: "Task 1",
                    description: "",
                    index: 0
                }
            ],
            index: 0
        },
        {
            id: "doing",
            title: "Doing",
            tasks: [],
            index: 1
        }
    ]
    const result = moveTaskToColumn(
        "task1",
        "todo",
        "doing",
        columns
    )
    expect(result[0].tasks.length).toBe(0)
    expect(result[1].tasks.length).toBe(1)
    expect(result[1].tasks[0].id).toBe("task1")
    expect(result[0].index).toBe(0)
    expect(result[1].index).toBe(1)
})

test("moves non-existing task", () => {
    const columns = [
        {
            id: "todo",
            title: "To Do",
            tasks: [
                {
                    id: "task1",
                    title: "Task 1",
                    description: "",
                    index: 0
                }
            ],
            index: 0
        },
        {
            id: "doing",
            title: "Doing",
            tasks: [],
            index: 1
        }
    ]
    const result = moveTaskToColumn(
        "nonExistingTask",
        "todo",
        "doing",
        columns
    )
    expect(result).toEqual(columns)
})

test("nonexisting from column", () => {
    const columns = [
        {
            id: "todo",
            title: "To Do",
            tasks: [
                {
                    id: "task1",
                    title: "Task 1",
                    description: "",
                    index: 0
                }
            ],
            index: 0
        },
        {
            id: "doing",
            title: "Doing",
            tasks: [],
            index: 1
        }
    ]
    const result = moveTaskToColumn(
        "task1",
        "nonExistingColumn",
        "doing",
        columns
    )
    expect(result).toEqual(columns)
})

test("nonexisting to column", () => {
    const columns = [
        {
            id: "todo",
            title: "To Do",
            tasks: [
                {
                    id: "task1",
                    title: "Task 1",
                    description: "",
                    index: 0
                }
            ],
            index: 0
        },
        {
            id: "doing",
            title: "Doing",
            tasks: [],
            index: 1
        }
    ]
    const result = moveTaskToColumn(
        "task1",
        "todo",
        "nonExistingColumn",
        columns
    )
    expect(result).toEqual(columns)
})

test("moves task to same column", () => {
    const columns = [
        {
            id: "todo",
            title: "To Do",
            tasks: [
                {
                    id: "task1",
                    title: "Task 1",
                    description: "",
                    index: 0
                }
            ],
            index: 0
        },
        {
            id: "doing",
            title: "Doing",
            tasks: [],
            index: 1
        }
    ]
    const result = moveTaskToColumn(
        "task1",
        "todo",
        "todo",
        columns
    )
    expect(result).toEqual(columns)
})

test("reorders tasks within a column", () => {
    const columns = [
        {
            id: "todo",
            title: "To Do",
            tasks: [
                {
                    id: "task1",
                    title: "Task 1",
                    description: "",
                    index: 0
                },
                {
                    id: "task2",
                    title: "Task 2",
                    description: "",
                    index: 1
                }
            ],
            index: 0
        }
    ]
    const result = reorderTask(
        "task1",
        "task2",
        "below",
        columns
    )
    expect(result[0].tasks[0].id).toBe("task2")
    expect(result[0].tasks[1].id).toBe("task1")
    expect(result[0].tasks[0].index).toBe(0)
    expect(result[0].tasks[1].index).toBe(1)
})

test("reorders non-existing task", () => {
    const columns = [
        {
            id: "todo",
            title: "To Do",
            tasks: [
                {
                    id: "task1",
                    title: "Task 1",
                    description: "",
                    index: 0
                },
                {
                    id: "task2",
                    title: "Task 2",
                    description: "",
                    index: 1
                }
            ],
            index: 0
        }
    ]
    const result = reorderTask(
        "nonExistingTask",
        "task2",
        "above",
        columns
    )
    expect(result).toEqual(columns)
})

test("reorders to non-existing target task", () => {
    const columns = [
        {
            id: "todo",
            title: "To Do",
            tasks: [
                {
                    id: "task1",
                    title: "Task 1",
                    description: "",
                    index: 0
                },
                {
                    id: "task2",
                    title: "Task 2",
                    description: "",
                    index: 1
                }
            ],
            index: 0
        }
    ]
    const result = reorderTask(
        "task1",
        "nonExistingTask",
        "above",
        columns
    )
    expect(result).toEqual(columns)
})

test("reorders task one slot forward", () => {
    const columns = [
        {
            id: "todo",
            title: "To Do",
            tasks: [
                {
                    id: "task1",
                    title: "Task 1",
                    description: "",
                    index: 0
                },
                {
                    id: "task2",
                    title: "Task 2",
                    description: "",
                    index: 1
                },
                {
                    id: "task3",
                    title: "Task 3",
                    description: "",
                    index: 2
                }
            ],
            index: 0
        }
    ]
    const result = reorderTask(
        "task1",
        "task2",
        "below",
        columns
    )
    expect(result[0].tasks[0].id).toBe("task2")
    expect(result[0].tasks[1].id).toBe("task1")
    expect(result[0].tasks[2].id).toBe("task3")
    expect(result[0].tasks[0].index).toBe(0)
    expect(result[0].tasks[1].index).toBe(1)
    expect(result[0].tasks[2].index).toBe(2)
})

test("reorders task one slot backward", () => {
    const columns = [
        {
            id: "todo",
            title: "To Do",
            tasks: [
                {
                    id: "task1",
                    title: "Task 1",
                    description: "",
                    index: 0
                },
                {
                    id: "task2",
                    title: "Task 2",
                    description: "",
                    index: 1
                },
                {
                    id: "task3",
                    title: "Task 3",
                    description: "",
                    index: 2
                }
            ],
            index: 0
        }
    ]
    const result = reorderTask(
        "task2",
        "task1",
        "above",
        columns
    )
    expect(result[0].tasks[0].id).toBe("task2")
    expect(result[0].tasks[1].id).toBe("task1")
    expect(result[0].tasks[2].id).toBe("task3")
    expect(result[0].tasks[0].index).toBe(0)
    expect(result[0].tasks[1].index).toBe(1)
    expect(result[0].tasks[2].index).toBe(2)
})

test("reorders task to same position", () => {
    const columns = [
        {
            id: "todo",
            title: "To Do",
            tasks: [
                {
                    id: "task1",
                    title: "Task 1",
                    description: "",
                    index: 0
                },
                {
                    id: "task2",
                    title: "Task 2",
                    description: "",
                    index: 1
                },
                {
                    id: "task3",
                    title: "Task 3",
                    description: "",
                    index: 2
                }
            ],
            index: 0
        }
    ]
    const result = reorderTask(
        "task2",
        "task2",
        "above",
        columns
    )
    expect(result).toEqual(columns)
})

test("reorders task in empty column", () => {
    const columns = [
        {
            id: "todo",
            title: "To Do",
            tasks: [],
            index: 0
        }
    ]
    const result = reorderTask(
        "task1",
        "task2",
        "above",
        columns
    )
    expect(result).toEqual(columns)
})

test("reorders task in column with one task", () => {
    const columns = [
        {
            id: "todo",
            title: "To Do",
            tasks: [
                {
                    id: "task1",
                    title: "Task 1",
                    description: "",
                    index: 0
                }
            ],
            index: 0
        }
    ]
    const result = reorderTask(
        "task1",
        "task1",
        "above",
        columns
    )
    expect(result).toEqual(columns)
})

test("reorder tasks 5 positions forwards", () => {
    const columns = [
        {
            id: "todo",
            title: "To Do",
            tasks: [
                {
                    id: "task1",
                    title: "Task 1",
                    description: "",
                    index: 0
                },
                {
                    id: "task2",
                    title: "Task 2",
                    description: "",
                    index: 1
                },
                {
                    id: "task3",
                    title: "Task 3",
                    description: "",
                    index: 2
                },
                {
                    id: "task4",
                    title: "Task 4",
                    description: "",
                    index: 3
                },
                {
                    id: "task5",
                    title: "Task 5",
                    description: "",
                    index: 4
                },
                {
                    id: "task6",
                    title: "Task 6",
                    description: "",
                    index: 5
                }
            ],
            index: 0
        }
    ]
    const result = reorderTask(
        "task1",
        "task6",
        "below",
        columns
    )
    expect(result[0].tasks[0].id).toBe("task2")
    expect(result[0].tasks[1].id).toBe("task3")
    expect(result[0].tasks[2].id).toBe("task4")
    expect(result[0].tasks[3].id).toBe("task5")
    expect(result[0].tasks[4].id).toBe("task6")
    expect(result[0].tasks[5].id).toBe("task1")
    expect(result[0].tasks[0].index).toBe(0)
    expect(result[0].tasks[1].index).toBe(1)
    expect(result[0].tasks[2].index).toBe(2)
    expect(result[0].tasks[3].index).toBe(3)
    expect(result[0].tasks[4].index).toBe(4)
    expect(result[0].tasks[5].index).toBe(5)
})

test("reorder tasks 5 positions backwards", () => {
    const columns = [
        {
            id: "todo",
            title: "To Do",
            tasks: [
                {
                    id: "task1",
                    title: "Task 1",
                    description: "",
                    index: 0
                },
                {
                    id: "task2",
                    title: "Task 2",
                    description: "",
                    index: 1
                },
                {
                    id: "task3",
                    title: "Task 3",
                    description: "",
                    index: 2
                },
                {
                    id: "task4",
                    title: "Task 4",
                    description: "",
                    index: 3
                },
                {
                    id: "task5",
                    title: "Task 5",
                    description: "",
                    index: 4
                },
                {
                    id: "task6",
                    title: "Task 6",
                    description: "",
                    index: 5
                }
            ],
            index: 0
        }
    ]
    const result = reorderTask(
        "task6",
        "task1",
        "above",
        columns
    )
    expect(result[0].tasks[0].id).toBe("task6")
    expect(result[0].tasks[1].id).toBe("task1")
    expect(result[0].tasks[2].id).toBe("task2")
    expect(result[0].tasks[3].id).toBe("task3")
    expect(result[0].tasks[4].id).toBe("task4")
    expect(result[0].tasks[5].id).toBe("task5")
    expect(result[0].tasks[0].index).toBe(0)
    expect(result[0].tasks[1].index).toBe(1)
    expect(result[0].tasks[2].index).toBe(2)
    expect(result[0].tasks[3].index).toBe(3)
    expect(result[0].tasks[4].index).toBe(4)
    expect(result[0].tasks[5].index).toBe(5)
})