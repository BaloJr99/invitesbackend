import { ILogger } from '../global/types.js'

export interface ILogsRepository {
  addLog(logger: ILogger): Promise<void>

  getLogs(): Promise<ILogger[]>
}
