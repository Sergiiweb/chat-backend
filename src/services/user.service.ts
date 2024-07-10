import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { configs } from "../configs/config";
import { db } from "../configs/firebase.config";

export const registerUserService = async (
  email: string,
  password: string,
  username: string,
) => {
  const userDoc = await db.collection("users").doc(email).get();
  if (userDoc.exists) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.collection("users").doc(email).set({
    email,
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  });

  return { message: "User registered successfully" };
};

export const loginUserService = async (email: string, password: string) => {
  const userDoc = await db.collection("users").doc(email).get();
  if (!userDoc.exists) {
    throw new Error("Invalid credentials");
  }

  const userData = userDoc.data();
  if (!userData) {
    throw new Error("Invalid user data");
  }

  const validPassword = await bcrypt.compare(password, userData.password);
  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { email: userData.email, username: userData.username },
    configs.JWT_ACCESS_SECRET,
    {
      expiresIn: "1h",
    },
  );

  return {
    token,
    user: { email: userData.email, username: userData.username },
  };
};

export const getUserService = async (email: string) => {
  const userDoc = await db.collection("users").doc(email).get();
  if (!userDoc.exists) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  if (!userData) {
    throw new Error("Invalid user data");
  }

  return { email: userData.email, username: userData.username };
};
