import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthenticatedRequest extends Request {
    user?: { email: string };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    jwt.verify(token, 'your_jwt_secret', (err, user) => {
        if (err) {
            res.status(403).json({ message: 'Invalid token' });
            return;
        }

        req.user = user as { email: string };
        next();
    });
};
