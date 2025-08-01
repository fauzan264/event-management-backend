import { Request, Response } from "express";
import { eventCreateService } from "../services/event.service";

export const eventCreateController = async (req: Request, res: Response) => {
  const {
    event_name,
    category,
    start_date,
    end_date,
    description,
    price,
    venue_name,
    venue_capacity,
    address
  } = req.body
  const { userId } = res.locals.payload

  const imageUrl = Array.isArray(req?.files)
    ? req.files
    : req.files
    ? (req.files as Record<string, Express.Multer.File[]>).image || []
    : []

  console.log(imageUrl)

  const { event, eventOrganizer, venue } = await eventCreateService({
    eventName: event_name,
    category,
    startDate: new Date(start_date),
    endDate: new Date(end_date),
    imageUrl, 
    description,
    price: Number(price),
    venueName: venue_name,
    venueCapacity: Number(venue_capacity),
    address,
    userId
  })

  const response = {
    id: event?.id,
    event_name: event?.eventName,
    category: event?.category,
    start_date: event?.startDate,
    end_date: event?.endDate,
    image_url: event?.imageUrl,
    description: event?.description,
    available_ticket: event?.availableTicket,
    price: event?.price,
    created_at: event?.createdAt,
    updated_at: event?.updatedAt,
    event_organizer: {
      name: eventOrganizer?.companyName
    },
    venue: {
      name: venue?.venueName,
      capacity: venue?.venueCapacity,
      address: venue?.address
    }
  }

  return res.status(201).json({
    status: true,
    message: 'Create event successful',
    data: response
  })
}