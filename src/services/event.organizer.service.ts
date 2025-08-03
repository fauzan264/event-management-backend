import snakecaseKeys from "snakecase-keys";
import { prisma } from "../db/connection";
import { EventOrganizer } from "../generated/prisma";
import { cloudinaryUpload } from "../lib/cloudinary.upload";

interface IUpdateEventOrganizerServiceProps extends Omit<EventOrganizer, 'bannerUrl' | 'createdAt' | 'updatedAt' | 'deletedAt'> {
  bannerUrl?: Express.Multer.File[]
}

type Banner = { bannerUrl: string | undefined | null }

export const updateEventOrganizerService = async ({
  id,
  companyName,
  email,
  phoneNumber,
  address,
  websiteUrl,
  bankAccount,
  bannerUrl,
  userId
}: IUpdateEventOrganizerServiceProps) => {

  const eventOrganizer = await prisma.eventOrganizer.findUnique({
    where: {
      id
    }
  })

  if (!eventOrganizer) 
    throw { message: `Event Organizer ${id} not found`, isExpose: true }

  if (eventOrganizer.userId != userId)
    throw { message: `Access denied. You do not have permission to modify this event organizer.`, isExpose: true }

  let createBanner: Banner[] = []
  if (bannerUrl?.length) {
    const uploadImage = bannerUrl.map(async(image) => {
      const { secureUrl } = await cloudinaryUpload(image?.buffer, 'banner_url') as { secureUrl: string | undefined }
  
      return { bannerUrl: secureUrl }
    })
  
    createBanner = await Promise.all(uploadImage)
  } else {
    
    if (eventOrganizer?.bannerUrl) {
      createBanner.push({bannerUrl: eventOrganizer?.bannerUrl})
    } else {
      throw { message: 'Banner image is required because it was not provided previously.', isExpose: true }
    }
  }

  const result = await prisma.$transaction(async(tx) => {

    const request = {
      companyName: companyName ? companyName : eventOrganizer.companyName,
      email: email ? email : eventOrganizer.email,
      phoneNumber: phoneNumber ? phoneNumber : eventOrganizer.phoneNumber,
      address: address ? address : eventOrganizer.address,
      websiteUrl: websiteUrl ? websiteUrl : eventOrganizer.websiteUrl,
      bankAccount: bankAccount ? bankAccount : eventOrganizer.bankAccount,
      bannerUrl: createBanner[0].bannerUrl != undefined ? createBanner[0].bannerUrl : eventOrganizer.bannerUrl,
      updatedAt: new Date()
    }

    const updateEventOrganizer = await tx.eventOrganizer.update({
      data: request,
      where: {
        id
      },
      omit: {
        deletedAt: true,
        userId: true
      }
    })

    return updateEventOrganizer
  })

  return snakecaseKeys(result)
}