import snakecaseKeys from "snakecase-keys";
import { prisma } from "../db/connection";
import { Category, Event, Venue } from "../generated/prisma";
import { cloudinaryUpload } from "../lib/cloudinary.upload";

interface ICreateEventServiceProps extends Pick<Event, 'eventName' | 'category' | 'startDate' | 'endDate' |  'description' | 'price'> {
  imageUrl: Express.Multer.File[]
}

export const eventCreateService = async ({
  eventName,
  category,
  startDate,
  endDate,
  description,
  price,
  imageUrl,
  venueName,
  venueCapacity,
  address,
  userId
}:
  ICreateEventServiceProps
  & Pick<Venue, 'venueName' | 'venueCapacity' | 'address'>
  & { userId: string }) => {
    
  const eventOrganizer = await prisma.eventOrganizer.findUnique({
    where: {
      userId: userId
    }
  })

  if (!eventOrganizer)
    throw { message: 'User does not have event organizer access', isExpose: true }

  if (!Object.values(Category).includes(category)) {
    throw { message: `Category '${category}' is not found`, isExpose: true }
  }

  if (startDate > endDate) {
    throw { message: "Start date must be earlier than or equal to end date.", isExpose: true}
  }
  const result = await prisma.$transaction(async(tx) => {
    // create venue
    const venue = await tx.venue.create({
      data: {
        venueName,
        venueCapacity,
        address
      }
    })

    const uploadImage = imageUrl.map(async(image) => {
      const res: any = await cloudinaryUpload(image?.buffer, 'event')

      return { imageUrl: res.secureUrl }
    })

    const imageCreate = await Promise.all(uploadImage)
  
    // create event
    const event = await tx.event.create({
      data: {
        eventName,
        category,
        startDate,
        endDate,
        imageUrl: imageCreate[0].imageUrl,
        description,
        price,
        availableTicket: venueCapacity,
        venueId: venue?.id,
        eventOrganizerId: eventOrganizer?.id
      },
      include: {
        eventOrganizer: {
          select: {
            companyName: true
          }
        },
        venue: {
          select: {
            venueName: true,
            venueCapacity: true,
            address: true
          }
        }
      }
    })
      
    return event
  })
  
  return snakecaseKeys(result, {deep: true})
}

interface IGetAllEventServiceProps {
  eventName?: string | undefined
  category?: string | undefined
  page?: number | undefined
  limit?: number | undefined
}

export const getAllEventService = async ({
  eventName,
  category,
  page,
  limit
}: IGetAllEventServiceProps ) => {
  const where: any = {}

  if (eventName)
    where.eventName = {
      contains: eventName
    }

  if (category && Object.values(Category).includes(category as Category)) {
    where.category = category
  }

  const pageNumber = page != undefined && page != 0 ? page - 1 : 1
  const limitNumber = limit != undefined ? limit : 10
  const offset = (pageNumber - 1) * limitNumber

  const totalData = await prisma.event.count({
    where: Object.keys(where).length > 0 ? where : undefined,
  })

  const totalPages = Math.ceil(totalData / limitNumber)

  const events = await prisma.event.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    skip: offset,
    take: limitNumber,
    omit: {
      venueId: true,
      eventOrganizerId: true,
      description: true,
      updatedAt: true,
      deletedAt: true
    }
  })

  const response = {
    events: events,
    pagination: {
      current_page: pageNumber,
      per_page: limitNumber,
      total_data: totalData,
      total_page: totalPages,
    }
  }

  return snakecaseKeys(response)
}