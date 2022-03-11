import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import log from "./logger";

const globalTryCatch = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      log.error(err.message);

      if (err.status === 404) {
        next(new createHttpError.NotFound(err.message));
        return;
      }

      if (err.status === 400) {
        next(new createHttpError.BadRequest(err.message));
        return;
      }

      if (err.name === "JsonWebTokenError") {
        next(new createHttpError.BadRequest(err.message));
        return;
      }

      next(new Error(err.message));
    });
  };
};

export default globalTryCatch;
