import { Router } from 'express'
import {
  authChangePasswordController,
  authLoginController,
  authRegisterController,
  authRequestResetPasswordController,
  authResetPasswordController
} from '../controllers/auth.controller'
import { jwtVerify } from '../middleware/jwt.verify'
import { authSessionLoginController } from '../controllers/event.controller'

const authRouter = Router()

authRouter.post('/register', authRegisterController)
authRouter.post('/login', authLoginController)
authRouter.post('/request-reset-password', authRequestResetPasswordController)
authRouter.post('/reset-password', jwtVerify, authResetPasswordController)
authRouter.get('/session', jwtVerify, authSessionLoginController)
authRouter.post('/change-password', jwtVerify, authChangePasswordController)

export default authRouter