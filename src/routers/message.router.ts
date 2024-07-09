import { Router } from "express";
import multer from "multer";

import {
  deleteMessage,
  editMessage,
  getMessageByUid,
  getMessages,
  sendMessage,
  uploadFiles,
} from "../controllers/message.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { fileMiddleware } from "../middlewares/files.middleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", authMiddleware.checkToken, sendMessage);
router.get("/", authMiddleware.checkToken, getMessages);
router.put("/:uid", authMiddleware.checkToken, editMessage);
router.delete("/:uid", authMiddleware.checkToken, deleteMessage);
router.get("/:uid", authMiddleware.checkToken, getMessageByUid);
router.post(
  "/upload",
  authMiddleware.checkToken,
  upload.array("files"),
  fileMiddleware.isFileValid,
  uploadFiles,
);

export const messageRouter = router;
