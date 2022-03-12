import { NextFunction, Request, Response } from "express";
import { CurrentUserDto, CustomRequest } from "../dtos/dto";
import userService from "../services/userService";

const userController = () => {
  return {
    register: async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<Response<CurrentUserDto>> => {
      return res.status(201).send(await userService().register(req.body));
    },

    login: async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<Response<CurrentUserDto>> => {
      return res.status(200).send(await userService().login(req.body));
    },

    currentUser: async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<Response<CurrentUserDto>> => {
      return res
        .status(200)
        .send(await userService().getCurrentUser(req.user.username));
    },

    confirmToken: async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<Response<CurrentUserDto>> => {
      const token: string = req.query.token as string;
      return res.status(200).send(await userService().confirmToken(token));
    },
  };
};

export default userController;
