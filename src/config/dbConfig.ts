import "reflect-metadata";
import { createConnection } from "typeorm";
import log from "../utils/logger";

createConnection()
  .then(async (connection) => {
    log.info("Connected to Database");
  })
  .catch((error) => console.log(error));

export default createConnection;
