import { NextFunction, Request, Response } from "express";

import {
  deleteMessageService,
  editMessageService,
  getMessageByUidService,
  getMessagesService,
  sendMessageService,
  uploadFilesService,
} from "../services/message.service";
import { AuthenticatedRequest } from "../types/req.type";

export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { text, files, photoURL } = req.body;
  const { email, username } = req.user;

  try {
    const result = await sendMessageService(
      email,
      username,
      text,
      files,
      photoURL,
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const messages = await getMessagesService();
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const editMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { uid } = req.params;
  const { text, files } = req.body;
  const { email } = req.user;

  try {
    const result = await editMessageService(uid, email, text, files);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { uid } = req.params;
  const { email } = req.user;

  try {
    const result = await deleteMessageService(uid, email);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getMessageByUid = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { uid } = req.params;

  try {
    const message = await getMessageByUidService(uid);
    res.json({ message });
  } catch (error) {
    next(error);
  }
};

export const uploadFiles = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const files = req.files as Express.Multer.File[];

  try {
    const uploadedFiles = await uploadFilesService(files);
    res.json({ files: uploadedFiles });
  } catch (error) {
    next(error);
  }
};
