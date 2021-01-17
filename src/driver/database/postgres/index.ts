import { Connection } from "typeorm";

let connection: Connection;

export const set = (cnn: Connection) => {
  if (connection) {
    throw new Error("Connection already exists");
  }
  connection = cnn;
};
export default {set}