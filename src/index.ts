import express, {Express, Request, Response, NextFunction} from "express"
import mainRouter from "./routers/index.router"
import cors from "cors"
import { expiryTransactionSchedule } from "./jobs/cron/expiry.transaction.schedule"
import { cancelTransactionSchedule } from "./jobs/cron/cancel.transaction.schedule"


const app: Express = express()
app.use(express.json())
app.use(cors())
const port = 4000

app.use(mainRouter)

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.log(error)
  res.status(500).json({
    success: false,
    message: error?.isExpose ? error?.message : 'Internal server error'
  })
})

expiryTransactionSchedule()
cancelTransactionSchedule()

app.listen(port, () => {
  console.log(`⚡️ Server is running on port ${port}`)
})