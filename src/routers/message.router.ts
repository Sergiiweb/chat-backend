import {Router} from 'express';
import {
    sendMessage,
    getMessages,
    editMessage,
    deleteMessage,
    uploadFiles,
} from '../controllers/message.controller';
import {authenticateToken} from "../middlewares/auth.middleware";

const router = Router();

router.post('/', authenticateToken, sendMessage);
router.get('/:chatId', authenticateToken, getMessages);
router.put('/:messageId', authenticateToken, editMessage);
router.delete('/:messageId', authenticateToken, deleteMessage);
router.post('/upload', authenticateToken, uploadFiles);

export const messageRouter = router;
