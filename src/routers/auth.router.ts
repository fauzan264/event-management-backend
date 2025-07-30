import { Router } from 'express'
import { authGenenerateCodeReferralController, authLoginController, authRegisterController } from '../controllers/auth.controller'
import { jwtVerify } from '../middleware/jwt.verify'

const authRouter = Router()

authRouter.post('/register', authRegisterController)
authRouter.post('/login', authLoginController)
authRouter.post('/generate/referral-code', jwtVerify, authGenenerateCodeReferralController)

export default authRouter