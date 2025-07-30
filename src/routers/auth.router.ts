import { Router } from 'express'
import { authLoginController, authRegisterController } from '../controllers/auth.controller'

const authRouter = Router()

authRouter.post('/register', authRegisterController)
authRouter.post('/login', authLoginController)

export default authRouter