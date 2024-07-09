import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {bucket, db} from "../configs/firebase.config";

interface AuthenticatedRequest extends Request {
    user?: { email: string };
}

export const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { chatId, text, files } = req.body;
    const { email } = req.user!;

    try {
        const message = {
            chatId,
            sender: email,
            text,
            files: files || [],
            createdAt: new Date().toISOString(),
        };

        const messageRef = await db.collection('messages').add(message);

        res.status(201).json({ id: messageRef.id, ...message });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
    const { chatId } = req.params;

    try {
        const messagesSnapshot = await db.collection('messages')
            .where('chatId', '==', chatId)
            .orderBy('createdAt', 'asc')
            .get();

        const messages = messagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const editMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { messageId } = req.params;
    const { text, files } = req.body;
    const { email } = req.user!;

    try {
        const messageRef = db.collection('messages').doc(messageId);
        const messageDoc = await messageRef.get();

        if (!messageDoc.exists) {
            res.status(404).json({ message: 'Message not found' });
            return;
        }

        if (messageDoc.data().sender !== email) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }

        await messageRef.update({ text, files, updatedAt: new Date().toISOString() });

        res.json({ message: 'Message updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { messageId } = req.params;
    const { email } = req.user!;

    try {
        const messageRef = db.collection('messages').doc(messageId);
        const messageDoc = await messageRef.get();

        if (!messageDoc.exists) {
            res.status(404).json({ message: 'Message not found' });
            return;
        }

        if (messageDoc.data().sender !== email) {
            res.status(403).json({ message: 'Unauthorized' });
            return;
        }

        await messageRef.delete();

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const uploadFiles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { files } = req.body;

    try {
        const uploadedFiles = await Promise.all(files.map(async (file: any) => {
            const fileName = `${uuidv4()}_${file.originalname}`;
            const fileRef = bucket.file(fileName);

            await fileRef.save(Buffer.from(file.buffer, 'base64'), {
                metadata: { contentType: file.mimetype },
                public: true,
            });

            const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

            return { url: fileUrl, name: file.originalname };
        }));

        res.json({ files: uploadedFiles });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
