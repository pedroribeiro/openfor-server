import { UserService } from './../services/User';
import { Request, Response } from "express";
import { Redis } from 'ioredis';
// import { SessionData } from "express-session"

export type Context = {
    req: Request & {
        session: any
    };
    res: Response;
    redis: Redis;
    userService: UserService;
}