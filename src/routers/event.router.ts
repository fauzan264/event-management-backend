import { Router } from "express";
import { jwtVerify } from "../middleware/jwt.verify";
import { eventCreateController, getAllEventController } from "../controllers/event.controller";
import { uploaderMulter } from "../middleware/uploader.multer";

const eventRouter = Router()

eventRouter.post('/', uploaderMulter(['image'], 'memoryStorage').fields([{name: 'image', maxCount: 1}]), jwtVerify, eventCreateController)
eventRouter.get('/', getAllEventController)

export default eventRouter