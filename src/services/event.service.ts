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
    return await prisma.$transaction(async(tx) => {
      const eventOrganizer = await tx.eventOrganizer.findFirst({
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
      console.log(imageCreate[0])
  
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
        }
      })

      return { event, eventOrganizer, venue }
    })
}