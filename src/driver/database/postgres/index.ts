export { Repository, DeleteResult, TreeRepository } from "typeorm";
import { Connection } from "typeorm";

let connection: Connection;

/**
 * Define connection with Database
 * @param cnn
 */
export const set = (cnn: Connection) => {
  if (connection) {
    throw new Error("already connected");
  }

  connection = cnn;
};

/**
 * Return existing connection for Datavase
 * @returns
 */
export const init = () => {
  if (!connection) {
    throw new Error("unable connection");
  }

  return connection;
};

export default { init, set };
