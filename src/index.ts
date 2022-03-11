import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import createHttpError from "http-errors";
import userRouter from "./routes/userRoutes";
import log from "./utils/logger";
import "./config/dbConfig";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", async (req: Request, res: Response, next: NextFunction) => {
  res.send("Welcome to Athena Chat.");
});

app.use("/api/user", userRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  next(new createHttpError.NotFound("Page Not Found"));
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.status || 500);
  res.send({
    status: err.status || 500,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  log.info(`Server Running On Port ${PORT}`);
});
