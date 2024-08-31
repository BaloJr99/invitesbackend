import { FieldPacket, Pool, RowDataPacket } from "mysql2/promise";
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

  getLogs = async () => {
    const todayMinus31 = new Date();
    todayMinus31.setDate(todayMinus31.getDate() - 31);

    const [results] = await this.connection.query(
      'SELECT BIN_TO_UUID(id) AS id, dateOfError, customError, exceptionMessage, CAST(userId AS CHAR) AS userId FROM errorLogs WHERE dateOfError >= ? ORDER BY dateOfError DESC',
      [ todayMinus31.toISOString().substring(0, 10) ]
    ) as [RowDataPacket[], FieldPacket[]];

    return results;
  }
}