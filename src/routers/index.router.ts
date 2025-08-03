import { Router } from "express"
import authRouter from "./auth.router"
import purchaseRouter from "./purchase.router"
import eventRouter from "./event.router"
import paymentRouter from "./uploadPayment"
import { orderConfirmationController } from "../controllers/orderconfirmation.controller"
import orderConfirmationrouter from "./orderconfirmation.router"
import eventOrganizerRouter from "./event.organizer.router"

const mainRouter = Router()

mainRouter.use('/api/auth', authRouter)
mainRouter.use('/api/purchase-order', purchaseRouter)
mainRouter.use('/api/events', eventRouter)
mainRouter.use('/api/purchase-order/uploadPayment', paymentRouter)
mainRouter.use('/api/purchase-order/', orderConfirmationrouter)
mainRouter.use('/api/event-organizers', eventOrganizerRouter)

export default mainRouter