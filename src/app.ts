import bodyParser from "body-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

import { configs } from "./configs/config";
import { messageRouter } from "./routers/message.router";
import { userRouter } from "./routers/user.router";

// import { authRouter, userRouter } from "./routers";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);
// app.use("/users", userRouter);
// app.use("/auth", authRouter);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  const status = error.status || 500;

  res.status(status).json({
    message: error.message,
    status: error.status,
  });
});

app.listen(configs.PORT, async () => {
  console.log(`Server has successfully started on PORT ${configs.PORT}`);
});
