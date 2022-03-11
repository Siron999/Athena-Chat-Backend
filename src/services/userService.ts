import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { getRepository } from "typeorm";
import { CurrentUserDto, RegisterDto, LoginDto } from "../dtos/dto";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import log from "../utils/logger";
import { ValidationError } from "class-validator";
import createHttpError from "http-errors";

const userService = () => {
  const userRepository = getRepository(User);
  return {
    register: async function (user: RegisterDto): Promise<CurrentUserDto> {
      const createdUser: User = userRepository.create({ ...user });

      //validating entity
      const valid: ValidationError[] | true = await createdUser.isValid();
      if (valid !== true) {
        throw new createHttpError.BadRequest(valid.toString());
      }

      //cheking if user already exists
      const userExists: User | undefined = await userRepository
        .createQueryBuilder()
        .where("user.username = :username", { username: user.username })
        .orWhere("user.email = :email", { email: user.email })
        .getOne();

      if (userExists) {
        throw new createHttpError.BadRequest(
          "The username or email is already taken"
        );
      }

      //hashingpassword
      const salt: string = await bcrypt.genSalt(5);
      const hashedPassword: string = await bcrypt.hash(
        createdUser.password,
        salt
      );
      createdUser.password = hashedPassword;

      const savedUser: User = await userRepository.save(createdUser);
      log.info(`User with username ${savedUser.username} registered`);

      //generating jwt token
      const token: string = this.generateJwt(savedUser.id, savedUser.username);

      return {
        id: savedUser.id,
        username: savedUser.username,
        fullName: savedUser.fullName,
        email: savedUser.email,
        mobileNumber: savedUser.mobileNumber,
        token,
      };
    },

    login: async function (user: LoginDto): Promise<CurrentUserDto> {
      const userExists: User | undefined = await userRepository.findOne({
        username: user.username,
      });

      //cheking if user exists
      if (!userExists) {
        throw new createHttpError.NotFound("User does not Exist");
      }

      //passwordcheck
      const passwordExists: boolean = await bcrypt.compare(
        user.password,
        userExists.password
      );
      if (!passwordExists) {
        throw new createHttpError.BadRequest("Password is incorrect");
      }

      //generating jwt token
      const token: string = this.generateJwt(
        userExists.id,
        userExists.username
      );
      log.info(`User with username ${userExists.username} logged in`);

      return {
        id: userExists.id,
        username: userExists.username,
        fullName: userExists.fullName,
        email: userExists.email,
        mobileNumber: userExists.mobileNumber,
        token,
      };
    },

    generateJwt: function (id: string, username: string): string {
      const token: string = jwt.sign(
        { id, username },
        process.env.TOKEN_SECRET as Secret
      );
      log.info("Token Generated");
      return token;
    },

    getCurrentUser: async function (username: string): Promise<CurrentUserDto> {
      const user: User | undefined = await userRepository.findOne({ username });

      //cheking if user exists
      if (!user) {
        throw new createHttpError.NotFound("User does not Exist");
      }

      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
      };
    },
  };
};

export default userService;
