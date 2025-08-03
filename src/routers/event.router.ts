import { Router } from "express";
import { jwtVerify } from "../middleware/jwt.verify";
import { createEventController, deleteEventController, getAllEventController, getEventByIdController, updateEventController } from "../controllers/event.controller";
import { uploaderMulter } from "../middleware/uploader.multer";

const eventRouter = Router()

eventRouter.post('/', uploaderMulter(['image'], 'memoryStorage').fields([{name: 'image', maxCount: 1}]), jwtVerify, createEventController)
eventRouter.get('/', getAllEventController)
eventRouter.get('/:eventId', getEventByIdController)
eventRouter.put('/:eventId', uploaderMulter(['image'], 'memoryStorage').fields([{name: 'image', maxCount: 1}]), jwtVerify, updateEventController)
eventRouter.delete('/:eventId', jwtVerify, deleteEventController)

export default eventRouter