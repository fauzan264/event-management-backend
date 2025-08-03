import { Router } from 'express'
import {
  authGenenerateCodeReferralController,
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
authRouter.post('/generate/referral-code', jwtVerify, authGenenerateCodeReferralController)
authRouter.post('/request-reset-password', authRequestResetPasswordController)
authRouter.put('/reset-password', jwtVerify, authResetPasswordController)
authRouter.get('/session', jwtVerify, authSessionLoginController)

export default authRouter