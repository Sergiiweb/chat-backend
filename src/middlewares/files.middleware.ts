import { NextFunction, Request, Response } from "express";

import { fileConfig } from "../configs/file.config";
import { ApiError } from "../errors/api.error";

class FilesMiddleware {
  public async isFileValid(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];

      files.map((file) => {
        const { size, mimetype } = file;

        if (size > fileConfig.MAX_SIZE) {
          throw new ApiError("File size is too big, 2Mb allowed", 400);
        }

        if (!fileConfig.MIMETYPES.includes(mimetype)) {
          throw new ApiError("File has invalid format", 400);
        }
      });

      next();
    } catch (e) {
      next(e);
    }
  }
}

export const fileMiddleware = new FilesMiddleware();
