import { Router } from "express"
import authRouter from "./auth.router"
import purchaseRouter from "./purchase.router"

const mainRouter = Router()

mainRouter.use('/api/auth', authRouter)
mainRouter.use('/api/events', purchaseRouter)

export default mainRouter