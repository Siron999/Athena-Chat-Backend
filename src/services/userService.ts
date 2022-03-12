import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { getRepository } from "typeorm";
import { CurrentUserDto, RegisterDto, LoginDto } from "../dtos/dto";
import bcrypt from "bcrypt";
import jwt, { Secret } from "jsonwebtoken";
import log from "../utils/logger";
import { ValidationError } from "class-validator";
import createHttpError from "http-errors";
import emailService from "./emailService";
import { ConfirmationToken } from "../entity/ConfirmationToken";
import { v4 as uuidv4 } from "uuid";
import { Logform } from "winston";

const userService = () => {
  const userRepository = getRepository(User);
  const tokenRepository = getRepository(ConfirmationToken);
  return {
    register: async function (user: RegisterDto): Promise<CurrentUserDto> {
      //checking if it contains numbers and dash only
      if (!/^[-0-9]{10,15}$/.test(user.mobileNumber))
        throw new createHttpError.BadRequest("Not a valid mobile number");

      //converting to string
      user.mobileNumber = user.mobileNumber.toString();

      const createdUser: User = userRepository.create({ ...user });

      //validating entity
      const valid: ValidationError[] | true = await createdUser.isValid();
      if (valid !== true) {
        throw new createHttpError.BadRequest(valid.toString());
      }

      //checking if user already exists
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

      const confirmationLink = await this.createConfirmationToken(createdUser);

      const savedUser: User = await userRepository.save(createdUser);
      log.info(`User with username ${savedUser.username} registered`);

      //generating jwt token
      const token: string = this.generateJwt(savedUser.id, savedUser.username);

      await emailService().sendMail(savedUser.email, confirmationLink);

      return {
        id: savedUser.id,
        username: savedUser.username,
        fullName: savedUser.fullName,
        email: savedUser.email,
        mobileNumber: savedUser.mobileNumber,
        activated: savedUser.activated,
        token,
      };
    },

    login: async function (user: LoginDto): Promise<CurrentUserDto> {
      const userExists: User | undefined = await this.findByUsername(
        user.username
      );

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
        activated: userExists.activated,
        token,
      };
    },

    confirmToken: async function (token: string): Promise<string> {
      const confirmationToken: ConfirmationToken | undefined =
        await tokenRepository.findOne({ token });

      //checking if token exists
      if (!confirmationToken) {
        throw new createHttpError.NotFound("Invalid Token");
      }

      //checking if token is already confirmed
      if (confirmationToken.confirmed) {
        throw new createHttpError.BadRequest("User already activated");
      }

      //confirming the token
      confirmationToken.confirmed = true;
      await tokenRepository.save(confirmationToken);
      log.info("Token Confirmed");

      //activating user
      await this.enableUser(confirmationToken.userId);

      return "Account Verified";
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
      const user: User | undefined = await this.findByUsername(username);

      return {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        activated: user.activated,
      };
    },

    createConfirmationToken: async function (user: User): Promise<string> {
      //generating random token
      const token: string = uuidv4();
      const createdToken: ConfirmationToken = new ConfirmationToken(
        token,
        new Date(),
        user
      );
      await tokenRepository.save(createdToken);

      log.info("Confirmation token created");

      return `${process.env.HOST}/api/user/confirm?token=${token}`;
    },

    enableUser: async function (userId: string): Promise<void> {
      const user: User | undefined = await this.findById(userId);

      //activating the user
      user.activated = true;
      await userRepository.save(user);
      log.info("User Enabled");
    },

    findByUsername: async function (username: string): Promise<User> {
      const user: User | undefined = await userRepository.findOne({ username });

      //checking if user exists
      if (!user) {
        throw new createHttpError.NotFound("User does not Exist");
      }
      log.info("User found");
      return user;
    },

    findById: async function (id: string): Promise<User> {
      const user: User | undefined = await userRepository.findOne(id);

      //checking if user exists
      if (!user) {
        throw new createHttpError.NotFound("User does not Exist");
      }
      log.info("User found");
      return user;
    },
  };
};

export default userService;
