import { NextFunction, Response } from "express";

import {
  getUserService,
  loginUserService,
  registerUserService,
} from "../services/user.service";
import { AuthenticatedRequest } from "../types/req.type";

export const registerUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { email, password, username } = req.body;

  try {
    const result = await registerUserService(email, password, username);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const result = await loginUserService(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { email } = req.user;

  try {
    const result = await getUserService(email);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
