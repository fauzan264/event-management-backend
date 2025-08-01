import { Router } from "express"
import authRouter from "./auth.router"
import purchaseRouter from "./purchase.router"
import eventRouter from "./event.router"

const mainRouter = Router()

mainRouter.use('/api/auth', authRouter)
mainRouter.use('/api/purchase-order', purchaseRouter)
mainRouter.use('/api/events', eventRouter)

export default mainRouter