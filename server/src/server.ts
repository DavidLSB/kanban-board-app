import express from "express"
import cors from "cors"
import { registerBoardRoutes} from "./routes/board.js"
import { registerColumnRoutes } from "./routes/columns.js"
import { registerCollumnCollectionRoutes } from "./routes/columnCollection.js"
import { registerTasksRoutes } from "./routes/tasks.js"
import { registerTasksCollectionRoutes } from "./routes/tasksCollection.js"

const app = express()

app.use(cors())
app.use(express.json())

registerBoardRoutes(app)
registerColumnRoutes(app)
registerCollumnCollectionRoutes(app)
registerTasksRoutes(app)
registerTasksCollectionRoutes(app)

app.listen(3001, () => {
  console.log("server running on port 3001")
})