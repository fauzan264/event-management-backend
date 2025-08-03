import snakecaseKeys from "snakecase-keys";
import { prisma } from "../db/connection";
import { Category, Event, Venue } from "../generated/prisma";
import { cloudinaryUpload } from "../lib/cloudinary.upload";
import { DateTime } from "luxon";

interface ICreateEventServiceProps extends Pick<Event, 'eventName' | 'category' | 'startDate' | 'endDate' |  'description' | 'price'> {
  imageUrl: Express.Multer.File[]
}

interface IUpdateEventServiceProps extends Pick<Event, 'id' | 'eventName' | 'category' | 'startDate' | 'endDate' |  'description' | 'price' | 'availableTicket'> {
  imageUrl: Express.Multer.File[]
}

type ImageEvent = { imageUrl: string | undefined | null }

export const createEventService = async ({
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

  if (startDate > endDate) 
    throw { message: "Start date must be earlier than or equal to end date.", isExpose: true}
  
  const uploadImage = imageUrl.map(async(image) => {
    const res: any = await cloudinaryUpload(image?.buffer, 'event')

    return { imageUrl: res.secureUrl }
  })

  const imageCreate = await Promise.all(uploadImage)

  const result = await prisma.$transaction(async(tx) => {
    // create venue
    const venue = await tx.venue.create({
      data: {
        venueName,
        venueCapacity,
        address
      }
    })
  
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
        eventOrganizerId: eventOrganizer?.id,
        createdAt: DateTime.now().setZone('Asia/Jakarta').toJSDate()
      },
      omit: {
        venueId: true,
        eventOrganizerId: true,
        description: true,
        deletedAt: true
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

  const formattedResponse = {
    ...result,
    createdAt: DateTime.fromJSDate(result.createdAt).setZone('Asia/Jakarta').toISO(),
    updatedAt: DateTime.fromJSDate(result.updatedAt).setZone('Asia/Jakarta').toISO()
  }
  
  return snakecaseKeys(formattedResponse, { deep: true })
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

export const updateEventService = async ({
  id,
  eventName,
  category,
  startDate,
  endDate,
  description,
  price,
  availableTicket,
  imageUrl,
  venueName,
  venueCapacity,
  address,
  userId
}: IUpdateEventServiceProps
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

  if (startDate > endDate) 
    throw { message: "Start date must be earlier than or equal to end date.", isExpose: true}


  const event = await prisma.event.findUnique({
    where: {
      id
    },
    include: {
      venue: true,
      eventOrganizer: true
    }
  })

  let updateImage: ImageEvent[] = []
  if (imageUrl?.length) {
    const uploadImage = imageUrl.map(async(image) => {
      const res: any = await cloudinaryUpload(image?.buffer, 'event')
  
      return { imageUrl: res.secureUrl }
    })

    updateImage = await Promise.all(uploadImage)
  } else {
    updateImage.push({ imageUrl: event?.imageUrl })
  }

  const result = await prisma.$transaction(async(tx) => {
    const requestUpdateVenue = {
      venueName: venueName ? venueName : event?.venue.venueName,
      venueCapacity: venueCapacity ? venueCapacity : event?.venue.venueCapacity,
      address: address ? address : event?.venue.address
    }

    // update venue
    await tx.venue.update({
      data: requestUpdateVenue,
      where: {
        id: event?.venueId
      }
    })

    const requestEvent = {
      eventName: eventName ? eventName : event?.eventName,
      category: category ? category : event?.category,
      startDate: startDate ? startDate : event?.startDate,
      endDate: endDate ? endDate : event?.endDate,
      imageUrl: updateImage[0]?.imageUrl ? updateImage[0].imageUrl : event?.imageUrl,
      description: description ? description : event?.description,
      price: price ? price : event?.price,
      availableTicket: availableTicket ? availableTicket : event?.availableTicket,
      updatedAt: DateTime.now().setZone('Asia/Jakarta').toJSDate()
    }

    const updateEvent = await tx.event.update({
      data: requestEvent,
      where: {
        id
      },
      omit: {
        venueId: true,
        eventOrganizerId: true,
        description: true,
        deletedAt: true,
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

    return updateEvent
  })

  const formattedResponse = {
    ...result,
    startDate: DateTime.fromJSDate(result.startDate).setZone('Asia/Jakarta').toISO(),
    endDate: DateTime.fromJSDate(result.endDate).setZone('Asia/Jakarta').toISO(),
    createdAt: DateTime.fromJSDate(result.createdAt).setZone('Asia/Jakarta').toISO(),
    updatedAt: DateTime.fromJSDate(result.updatedAt).setZone('Asia/Jakarta').toISO()
  }

  return snakecaseKeys(formattedResponse, { deep: true  })
}