import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import { configs } from "../configs/config";
import { AuthenticatedRequest } from "../types/req.type";

class AuthMiddleware {
  public async checkToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    jwt.verify(token, configs.JWT_ACCESS_SECRET, (err, user) => {
      if (err) {
        res.status(403).json({ message: "Invalid token" });
        return;
      }

      req.user = user as { email: string; username: string };
      next();
    });
  }
}

export const authMiddleware = new AuthMiddleware();
