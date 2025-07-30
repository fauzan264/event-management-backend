import { Router } from 'express'
import { authRegisterController } from '../controllers/auth.controller'

const authRouter = Router()

authRouter.post('/register', authRegisterController)

export default authRouter