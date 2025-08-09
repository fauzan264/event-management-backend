import { Router } from "express";
import { jwtVerify } from "../middleware/jwt.verify";
import {
  getMyEventOrganizerController,
  getMyUserController,
  updateUserController,
} from "../controllers/user.controller";
import { uploaderMulter } from "../middleware/uploader.multer";

const userRouter = Router();

userRouter.put(
  "/:id",
  uploaderMulter(["image"], "memoryStorage").fields([
    { name: "profile_picture", maxCount: 1 },
  ]),
  jwtVerify,
  updateUserController
);
userRouter.get(
  "/:id/event-organizer",
  jwtVerify,
  getMyEventOrganizerController
);

userRouter.get("/me",
  jwtVerify,
  getMyUserController 
);

export default userRouter;
