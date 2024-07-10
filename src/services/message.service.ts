import { v4 as uuidv4 } from "uuid";

import { configs } from "../configs/config";
import { bucket, db } from "../configs/firebase.config";

export const sendMessageService = async (
  email: string,
  username: string,
  text: string,
  files: any[],
  photoURL: string,
) => {
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

  return { id: messageRef.id, ...message };
};

export const getMessagesService = async () => {
  const messagesSnapshot = await db
    .collection("messages")
    .orderBy("createdAt", "asc")
    .get();

  return messagesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const editMessageService = async (
  uid: string,
  email: string,
  text: string,
  files: any[],
) => {
  const messagesSnapshot = await db
    .collection("messages")
    .where("uid", "==", uid)
    .get();

  if (messagesSnapshot.empty) {
    throw new Error("Message not found");
  }

  const messageDoc = messagesSnapshot.docs[0];
  const messageRef = messageDoc.ref;

  if (messageDoc.data().email !== email) {
    throw new Error("Unauthorized");
  }

  await messageRef.update({
    text,
    files,
    updatedAt: new Date().toISOString(),
  });

  return { message: "Message updated successfully" };
};

export const deleteMessageService = async (uid: string, email: string) => {
  const messagesSnapshot = await db
    .collection("messages")
    .where("uid", "==", uid)
    .get();

  if (messagesSnapshot.empty) {
    throw new Error("Message not found");
  }

  const messageDoc = messagesSnapshot.docs[0];
  const messageRef = messageDoc.ref;

  if (messageDoc.data().email !== email) {
    throw new Error("Unauthorized");
  }

  await messageRef.delete();

  return { message: "Message deleted successfully" };
};

export const getMessageByUidService = async (uid: string) => {
  const messagesSnapshot = await db
    .collection("messages")
    .where("uid", "==", uid)
    .get();

  if (messagesSnapshot.empty) {
    throw new Error("Message not found");
  }

  const messageDoc = messagesSnapshot.docs[0];
  return messageDoc.data();
};

export const uploadFilesService = async (files: Express.Multer.File[]) => {
  if (!files || !Array.isArray(files)) {
    throw new Error("No files uploaded");
  }

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

  return uploadedFiles;
};
