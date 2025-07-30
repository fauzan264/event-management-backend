import { Request, Response } from "express"
import { authRegisterService } from "../services/auth.service"

export const authRegisterController = async (req: Request, res: Response) => {
  const {
    id_card_number,
    fullname,
    date_of_birth,
    email,
    password,
    phone_number,
    referral_code
  } = req.body

  await authRegisterService({
    idCardNumber: id_card_number,
    fullName: fullname,
    dateOfBirth: date_of_birth,
    email: email,
    password: password,
    phoneNumber: phone_number,
    referralCode: referral_code
  })

  res.status(201).json({
    success: true,
    message: 'Register user successful',
    data: {
      fullname,
      email
    }
  })
}