import { jwtSign } from '../lib/jwt.sign'
import { prisma } from '../db/connection'
import { User } from '../generated/prisma'
import bcrypt from 'bcrypt'
import { DateTime } from 'luxon'
import { generateCode } from '../utils/generate.code'

export const authRegisterService = async ({
  idCardNumber,
  fullName,
  dateOfBirth,
  email,
  password,
  phoneNumber,
  referralCode
}: Omit<User, 'id' | 'profilePicture' | 'totalUserPoint' | 'createdAt'| 'updatedAt' | 'deletedAt'>) => {
  return await prisma.$transaction(async(tx) => {
    
    let referral: User | null = null
    const rewardPoint = 10000
    if (referralCode) {
      referral = await tx.user.findFirst({
        where: {
          referralCode
        }
      })
  
      if (!referral) {
        throw { message: `referral code ${referralCode} is not found`, isExpose: true }
      }

      referral.totalUserPoint += rewardPoint
    }
  
    const saltRound = 10
    const hashedPassword = await bcrypt.hash(password, saltRound)
  
    const totalUserPoint = 0

    const createdUser = await tx.user.create({
      data: {
        idCardNumber,
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        email,
        password: hashedPassword,
        phoneNumber,
        totalUserPoint
      }
    })
  
    await jwtSign(
      { userId: createdUser?.id },
      process.env.JWT_SECRET_KEY!,
      { algorithm: "HS256" }
    )

    if (referral) {
      const now = DateTime.now().setZone('Asia/Jakarta')
      const threeMonthLater = now.plus({ months: 3 })

      await tx.user.update({
        data: {
          totalUserPoint: referral?.totalUserPoint
        },
        where: {
          id: referral?.id
        }
      })

      await tx.userPoint.create({
        data: {
          userId: referral?.id,
          points: rewardPoint,
          expiredAt: threeMonthLater.toISO()!,
        }
      })
    }
  })

}

export const authLoginService = async ({email, password}: Pick<User, 'email' | 'password'>) => {
  const findUserByEmail = await prisma.user.findFirst({
    where: { email }
  })

  if (!findUserByEmail) throw { message: 'Email is not register', isExpose: true }

  const comparePassword = await bcrypt.compare(password, findUserByEmail?.password)

  if (!comparePassword) throw { message: 'Password not valid', isExpose: true }

  const token = await jwtSign(
    { userId: findUserByEmail?.id },
    process.env.JWT_SECRET_KEY!,
    { algorithm: 'HS256' }
  )

  return { token, fullName: findUserByEmail?.fullName }
}

export const authGenenerateCodeReferralService = async ({ id }: Pick<User, 'id'>) => {
  const findUserById = await prisma.user.findFirst({
    where: { id }
  })

  if (!findUserById)
    throw { message: `User with id = ${id} is not found`, isExpose: true }

  if (findUserById.referralCode)
    throw { message: `Referral code already exists and cannot be regenerated.`, isExpose: true }
  
  const createReferralCode = await prisma.user.update({
    data: {
      referralCode: generateCode("REF-")
    },
    where: {
      id
    }
  })

  return createReferralCode.referralCode
}