import express from "express"
import cors from "cors"
import { registerBoardRoutes} from "./routes/board.js"
import { registerColumnRoutes } from "./routes/columns.js"
import { registerCollumnCollectionRoutes } from "./routes/columnCollection.js"
import { registerTasksRoutes } from "./routes/tasks.js"
import { registerTasksCollectionRoutes } from "./routes/tasksCollection.js"
import { registerUserRoutes } from "./routes/user.js"
const app = express()

app.use(cors({
    origin: 'https://kanban-board-app-13z4.vercel.app/',
    credentials: true
}))
app.use(express.json())

registerUserRoutes(app)
registerBoardRoutes(app)
registerColumnRoutes(app)
registerCollumnCollectionRoutes(app)
registerTasksRoutes(app)
registerTasksCollectionRoutes(app)

export default app