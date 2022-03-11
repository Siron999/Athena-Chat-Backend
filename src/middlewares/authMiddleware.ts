import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { CustomRequest } from "../dtos/dto";
import log from "../utils/logger";

//jwt token validation
const authAguard = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined = req.header("Authorization");
  if (!token) {
    log.error("No Authorization Token, Access Denied");
    throw new Error("No Authorization Token, Access Denied");
  }
  token = token.substring(7);

  //verifying token
  const verified: any = jwt.verify(token, process.env.TOKEN_SECRET as Secret);
  if (!verified) {
    log.error("Token Verification Failed, Access Denied");
    throw new Error("Token Verification Failed, Access Denied");
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
