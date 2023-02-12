import express from "express";
import protect from "../Middleware/authMiddleware.js";
import {
  accessChat,
  addMember,
  createGroupChat,
  fetchChats,
  removeMember,
  renameGroup,
} from "../Controllers/chatController.js";

const router = express.Router();

router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route("/group").post(protect, createGroupChat);
router.route("/rename").put(protect, renameGroup);
router.route("/groupremove").put(protect, removeMember);
router.route("/groupadd").put(protect, addMember);

export default router;
