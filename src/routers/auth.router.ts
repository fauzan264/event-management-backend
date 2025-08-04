import { Router } from 'express'
import {
  authChangePasswordController,
  authLoginController,
  authRegisterController,
  authRequestResetPasswordController,
  authResetPasswordController,
  authSessionLoginController
} from '../controllers/auth.controller'
import { jwtVerify } from '../middleware/jwt.verify'

const authRouter = Router()

authRouter.post('/register', authRegisterController)
authRouter.post('/login', authLoginController)
authRouter.post('/request-reset-password', authRequestResetPasswordController)
authRouter.post('/reset-password', jwtVerify, authResetPasswordController)
authRouter.get('/session', jwtVerify, authSessionLoginController)
authRouter.post('/change-password', jwtVerify, authChangePasswordController)

export default authRouter