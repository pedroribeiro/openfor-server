import "reflect-metadata";
import { UserResolver } from "./../resolvers/User";
import express from "express";
import cors from "cors";
import postgres from "../driver/database/postgres";
import { createConnection } from "typeorm";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { init as InitUserService } from "../services/User";
const start = async () => {
  const connection = await createConnection();

  postgres.set(connection);

  //   connection.runMigrations();

  const app = express();

  app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000",
    })
  );

  const apollo = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
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
