import { Router } from "express";
import { jwtVerify } from "../middleware/jwt.verify";
import { uploaderMulter } from "../middleware/uploader.multer";
import { updateEventOrganizerController } from "../controllers/event.organizer.controller";

const eventOrganizerRouter = Router()

eventOrganizerRouter.put('/:eventOrganizerId', uploaderMulter(['image'], 'memoryStorage').fields([{name: 'banner_url', maxCount: 1}]), jwtVerify, updateEventOrganizerController)

export default eventOrganizerRouter