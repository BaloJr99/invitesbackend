import { Response } from "express";
import { LoggerService } from "../services/logger";

export class ErrorHandler {
  constructor (
    private loggerService: LoggerService
  ) {
    this.loggerService = loggerService;
  }

  handleHttp = async (res: Response, error: string, fullError: string, userId: string) => {
    await this.loggerService.addLog({
      dateOfError: new Date(),
      customError: error,
      exceptionMessage: fullError,
      userId: userId
    });

    res.status(500).send(error);
  }
}