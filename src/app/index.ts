import { Context } from './../types/Context';
import "reflect-metadata";
import { UserResolver } from "./../resolvers/User";
import express from "express";
import cors from "cors";
import postgres from "../driver/database/postgres";
import Redis from "ioredis";
import connectRedis from "connect-redis";
import session from "express-session";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { init as InitUserService } from "../services/User";
const start = async () => {
  const connection = await createConnection();

  postgres.set(connection);

  //   connection.runMigrations();

  const app = express();
  const redis = new Redis(process.env.REDIS_URL);
  const RedisStore = connectRedis(session);

  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000",
    })
  );

  app.use(
    session({
      name: "openFor",
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.SERVER_MODE === "production" ? true : false,
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET!,
      resave: false,
    })
  );

  const apollo = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      validate: false,
    }),
    context: ({ req, res }): Context => ({
      req,
      res,
      redis,
      userService: InitUserService(),
    }),
  });

  apollo.applyMiddleware({ app, cors: false });

  app.listen({ port: 4000 }, () => {
    console.log(
      `OPEN FORUM RUNNING AT:  http://localhost:4000${apollo.graphqlPath} 🚀`
    );
  });
};

start().catch((error) => {
  console.log("ERROR => ", error);
});
