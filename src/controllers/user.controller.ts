import bcrypt from "bcryptjs";
import { Response } from "express";
import jwt from "jsonwebtoken";

import { db } from "../configs/firebase.config";
import { AuthenticatedRequest } from "../types/req.type";

export const registerUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const { email, password, username } = req.body;

  try {
    const userDoc = await db.collection("users").doc(email).get();
    if (userDoc.exists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("users").doc(email).set({
      email,
      username,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const { email, password } = req.body;

  try {
    const userDoc = await db.collection("users").doc(email).get();
    if (!userDoc.exists) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const userData = userDoc.data();

    if (!userData) {
      res.status(400).json({ message: "Invalid user data" });
      return;
    }

    const validPassword = await bcrypt.compare(password, userData!.password);

    if (!validPassword) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ email: userData.email }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: { email: userData.email, username: userData.username },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const { email } = req.user;

  try {
    const userDoc = await db.collection("users").doc(email).get();
    if (!userDoc.exists) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const userData = userDoc.data();

    if (!userData) {
      res.status(400).json({ message: "Invalid user data" });
      return;
    }

    res.json({ email: userData.email, username: userData.username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
