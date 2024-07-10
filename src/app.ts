import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

import { configs } from "./configs/config";
import { messageRouter } from "./routers/message.router";
import { userRouter } from "./routers/user.router";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

app.listen(configs.PORT, async () => {
  console.log(`Server has successfully started on PORT ${configs.PORT}`);
});
