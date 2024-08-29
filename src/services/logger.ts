import { Pool } from "mysql2/promise";
import { Logger } from "../interfaces/loggerModel";

export class LoggerService {
  constructor (private connection: Pool) {
    this.connection = connection;
  }

  addLog = async (logger: Logger) => {
    const {
      dateOfError,
      customError,
      exceptionMessage,
      userId
    } = logger;

    await this.connection.query(
      `INSERT INTO errorLogs (dateOfError, customError, exceptionMessage, userId) VALUES (?, ?, ?, ?)`,
      [
        dateOfError,
        customError, 
        exceptionMessage,
        userId
      ]
    );
  }
}