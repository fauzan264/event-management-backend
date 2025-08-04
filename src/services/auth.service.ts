import { jwtSign } from '../lib/jwt.sign'
import { prisma } from '../db/connection'
import { User, UserRole } from '../generated/prisma'
import bcrypt from 'bcrypt'
import { DateTime } from 'luxon'
import { generateCode } from '../utils/generate.code'
import fs from 'fs'
import Handlebars from 'handlebars'
import { transporter } from '../lib/transporter'

export const authRegisterService = async ({
  idCardNumber,
  fullName,
  dateOfBirth,
  email,
  password,
  phoneNumber,
  referralCode,
  userRole
}: Omit<User, 'id' | 'profilePicture' | 'totalUserPoint' | 'createdAt'| 'updatedAt' | 'deletedAt'>) => {
  try {
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
          referralCode: generateCode("REF-"),
          totalUserPoint,
          userRole
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
  
      if (userRole == UserRole.EVENT_ORGANIZER) {
        await tx.eventOrganizer.create({
          data: {
            companyName: `${fullName} company`,
            email: email,
            userId: createdUser.id
          }
        })
      }
    })
  } catch (error: any) {
    if (error?.code === "P2002" ) {
      if (error?.meta?.target.includes("id_card_number")) {
        throw { message: "ID Card Number already exists", isExpose: true }
      } else if (error?.meta?.target.includes("email")) {
        throw { message: "Email already exists", isExpose: true }
      }
    }
  }
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

export const authRequestResetPasswordService = async ({email}: Pick<User, 'email'>) => {
  const checkUserByEmail = await prisma.user.findFirst({
    where: {
      email: email
    }
  })
  
  if (!checkUserByEmail) throw { message: `User with email '${email}' is not registered`, isExpose: true }

  const token = await jwtSign(
    { userId: checkUserByEmail?.id },
    process.env.JWT_SECRET_KEY!,
    { algorithm: 'HS256' }
  )

  const templateHtml = fs.readFileSync('src/public/template.html', 'utf-8')
  const compiledTemplateHtml = Handlebars.compile(templateHtml)

  const resultTemplateHtml = compiledTemplateHtml({
    fullname: checkUserByEmail.fullName,
    resetLinkPassword: `${process.env.LINK_RESET_PASSWORD}/${token}`
  })

  await transporter.sendMail({
    to: email,
    subject: 'Reset your Event Management password',
    html: resultTemplateHtml
  })
}

export const authResetPasswordService = async ({id, password}: Pick<User, 'id' | 'password'>) => {
  const findUserById = await prisma.user.findUnique({ where: { id } }) 

  if (!findUserById)
    throw { message: `User with id = ${id} is not found`, isExpose: true }

  const hashedPassword = await bcrypt.hash(password, 10)

  await prisma.user.update({
    data: { password: hashedPassword },
    where: { id }
  })
}

export const authSessionLoginService = async ({ id }: Pick<User, 'id'>) => {
  const user = await prisma.user.findUnique({
    where: {
      id
    }
  })

  return {
    role: user?.userRole,
    fullname: user?.fullName
  }
}

export const authChangePasswordService = async ({oldPassword, newPassword, userId}: {oldPassword: string, newPassword: string, userId: string}) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  })

  if (!user) throw { message: `User not found`, isExpose: true }

  const comparePassword = await bcrypt.compare(oldPassword, user?.password)

  if (!comparePassword)
    throw { message: 'The password you entered does not match our records.', isExpose: true }

  if (oldPassword == newPassword)
    throw { message: 'New password cannot be the same as the old password.', isExpose: true }

  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(newPassword, saltRounds)

  await prisma.user.update({
    data: {
      password: hashedPassword
    },
    where: {
      id: userId
    }
  })
}