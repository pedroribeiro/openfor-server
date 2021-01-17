import { createConnection } from "typeorm";
import postgres from "../driver/database/postgres"
const start = async () => {
  const connection = await createConnection();
  connection.runMigrations()
  postgres.set(connection)
};

start()