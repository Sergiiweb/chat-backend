import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import { configs } from "../configs/config";
import { bucket, db } from "../configs/firebase.config";
import { AuthenticatedRequest } from "../types/req.type";

export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const { text, files, photoURL } = req.body;
  const { email, username } = req.user;

  try {
    const message = {
      displayName: username,
      text,
      email,
      photoURL: photoURL || configs.AVATAR,
      files: files || [],
      uid: uuidv4(),
      createdAt: new Date(),
    };

    const messageRef = await db.collection("messages").add(message);

    res.status(201).json({ id: messageRef.id, ...message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const messagesSnapshot = await db
      .collection("messages")
      .orderBy("createdAt", "asc")
      .get();

    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const editMessage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const { uid } = req.params;
  const { text, files } = req.body;
  const { email } = req.user!;

  try {
    const messagesSnapshot = await db
      .collection("messages")
      .where("uid", "==", uid)
      .get();

    if (messagesSnapshot.empty) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    const messageDoc = messagesSnapshot.docs[0];
    const messageRef = messageDoc.ref;

    if (messageDoc.data().email !== email) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    await messageRef.update({
      text,
      files,
      updatedAt: new Date().toISOString(),
    });

    res.json({ message: "Message updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMessage = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const { uid } = req.params;
  const { email } = req.user!;

  try {
    const messagesSnapshot = await db
      .collection("messages")
      .where("uid", "==", uid)
      .get();

    if (messagesSnapshot.empty) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    const messageDoc = messagesSnapshot.docs[0];
    const messageRef = messageDoc.ref;

    if (messageDoc.data().email !== email) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    await messageRef.delete();

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessageByUid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { uid } = req.params;

  try {
    const messagesSnapshot = await db
      .collection("messages")
      .where("uid", "==", uid)
      .get();

    if (messagesSnapshot.empty) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    const messageDoc = messagesSnapshot.docs[0];
    const messageData = messageDoc.data();

    res.json({ message: messageData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadFiles = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const files = req.files as Express.Multer.File[];

  if (!files || !Array.isArray(files)) {
    res.status(400).json({ message: "No files uploaded" });
    return;
  }

  console.log(files);

  try {
    const uploadedFiles = await Promise.all(
      files.map(async (file: Express.Multer.File) => {
        const fileName = `${uuidv4()}_${file.originalname}`;
        const fileRef = bucket.file(fileName);

        await fileRef.save(file.buffer, {
          metadata: { contentType: file.mimetype },
          public: true,
        });

        const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        return { url: fileUrl, name: file.originalname };
      }),
    );

    res.json({ files: uploadedFiles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
