import { Request, Response } from "express";
import { createEventService, getAllEventService } from "../services/event.service";

export const createEventController = async (req: Request, res: Response) => {
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

  const event = await createEventService({
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

  return res.status(201).json({
    status: true,
    message: 'Create event successful',
    data: event
  })
}

export const getAllEventController = async (req: Request, res: Response) => {
  let {
    event_name,
    category,
    page,
    limit
  } = req.query

  const events = await getAllEventService({
    eventName: event_name ? String(event_name) : undefined,
    category: category ? String(category) : undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined
  })

  return res.status(200).json({
    status: true,
    message: "success get data",
    data: events
  })
}