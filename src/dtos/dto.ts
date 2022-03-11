import { Request } from "express";

export interface RegisterDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  mobileNumber: number;
  password: string;
}

export interface CurrentUserDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  mobileNumber: number;
  token?: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface CustomRequest extends Request {
  [key: string]: any;
}
