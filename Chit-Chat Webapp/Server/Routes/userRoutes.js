import express from "express";
import {
  registerUser,
  authUser,
  allUser,
  storeNotification,
  getNotifications,
  removeNotification,
} from "../Controllers/userControllers.js";
import protect from "../Middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUser);
router.post("/login", authUser);
router.route('/storenotification').post(protect, storeNotification);
router.route('/getnotifications/:id').get(protect, getNotifications);
router.route('/removenotification').put(protect, removeNotification);

export default router;
