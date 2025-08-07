import { Request, Response } from "express";
import {
  createEventService,
  deleteEventService,
  getAllEventService,
  getEventByIdService,
  updateEventService,
} from "../services/event.service";

export const createEventController = async (req: Request, res: Response) => {
  const {
    event_name,
    category,
    start_date,
    end_date,
    description,
    price,
    available_ticket,
    venue_name,
    venue_capacity,
    address,
  } = req.body;

  const { userId } = res.locals.payload;

  const imageUrl = Array.isArray(req?.files)
    ? req.files
    : req.files
    ? (req.files as Record<string, Express.Multer.File[]>).image || []
    : [];

  const event = await createEventService({
    eventName: event_name,
    category,
    startDate: new Date(start_date),
    endDate: new Date(end_date),
    imageUrl,
    description,
    price: Number(price),
    availableTicket: Number(available_ticket),
    venueName: venue_name,
    venueCapacity: Number(venue_capacity),
    address,
    userId,
  });

  return res.status(201).json({
    status: true,
    message: "Event created successfully.",
    data: event,
  });
};

export const getAllEventController = async (req: Request, res: Response) => {
  let { event_name, category, page, limit } = req.query;

  const events = await getAllEventService({
    eventName: event_name ? String(event_name) : undefined,
    category: category ? String(category) : undefined,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });

  return res.status(200).json({
    status: true,
    message: "Successfully fetched list of events.",
    data: events,
  });
};

export const getEventByIdController = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  const event = await getEventByIdService({ id: eventId });

  return res.status(200).json({
    status: true,
    message: "Event details fetched successfully.",
    data: event,
  });
};

export const updateEventController = async (req: Request, res: Response) => {
  const {
    event_name,
    category,
    start_date,
    end_date,
    description,
    price,
    available_ticket,
    venue_name,
    venue_capacity,
    address,
  } = req.body;

  const { userId } = res.locals.payload;

  const imageUrl = Array.isArray(req?.files)
    ? req.files
    : req.files
    ? (req.files as Record<string, Express.Multer.File[]>).image || []
    : [];

  const { eventId } = req.params;

  const event = await updateEventService({
    id: eventId,
    eventName: event_name,
    category,
    startDate: new Date(start_date),
    endDate: new Date(end_date),
    imageUrl,
    description,
    price: Number(price),
    availableTicket: Number(available_ticket),
    venueName: venue_name,
    venueCapacity: Number(venue_capacity),
    address,
    userId,
  });

  return res.status(200).json({
    status: true,
    message: "Event updated successfully.",
    data: event,
  });
};

export const deleteEventController = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { userId } = res.locals.payload;

  await deleteEventService({
    id: eventId,
    userId,
  });

  return res.status(200).json({
    status: true,
    message: "Event deleted successfully.",
  });
};
