import { UserService } from './../services/User';
import { Request, Response } from "express";

export type Context = {
    req: Request
    res: Response
    userService: UserService
}