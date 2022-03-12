import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import log from "./logger";

const globalTryCatch = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      log.error(err.status ? `${err.status} - ${err.message}` : err.message);

      if (err.status === 404) {
        next(new createHttpError.NotFound(err.message));
        return;
      }

      if (err.status === 400) {
        next(new createHttpError.BadRequest(err.message));
        return;
      }

      if (err.status === 401) {
        next(new createHttpError.Unauthorized(err.message));
        return;
      }

      if (err.status === 403) {
        next(new createHttpError.Forbidden(err.message));
        return;
      }

      if (err.name === "JsonWebTokenError") {
        next(new createHttpError.Unauthorized(err.message));
        return;
      }

      next(new Error(err.message));
    });
  };
};

export default globalTryCatch;
