import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { CustomRequest } from "../dtos/dto";
import log from "../utils/logger";
import createHttpError from "http-errors";
import { User } from "../entity/User";
import userService from "../services/userService";

//jwt token validation
const authAguard = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined = req.header("Authorization");
  if (!token) {
    throw new createHttpError.Unauthorized(
      "No Authorization Token, Access Denied"
    );
  }
  token = token.substring(7);

  //verifying token
  const verified: any = jwt.verify(token, process.env.TOKEN_SECRET as Secret);
  if (!verified) {
    throw new createHttpError.Unauthorized(
      "Token Verification Failed, Access Denied"
    );
  }

  const user: User = await userService().findByUsername(verified.username);

  if (!user.activated) {
    throw new createHttpError.Forbidden("Account Not Verified");
  }

  log.info("Token Valid");

  //adding payload to req.user
  req.user = {
    id: verified.id,
    username: verified.username,
  };

  //forwarding request if token is verified
  next();
};

export default authAguard;
