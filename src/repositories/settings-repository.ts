import { FieldPacket, RowDataPacket } from 'mysql2'
import { ISettingsRepository } from '../interfaces/settings-repository.js'
import { IBaseSettings } from '../global/types.js'
import { MysqlDatabase } from '../services/mysql-database.js'

export class SettingsRepository implements ISettingsRepository {
  constructor(private database: MysqlDatabase) {
    this.database = database
  }

  getEventSettingsById = async (eventId: string): Promise<IBaseSettings[]> => {
    const connection = await this.database.getConnection()

    try {
      const [result] = (await connection.query(
        'SELECT BIN_TO_UUID(eventId) eventId, settings FROM settings WHERE eventId = UUID_TO_BIN(?)',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      return result as IBaseSettings[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  createEventSettings = async (
    eventSettings: IBaseSettings
  ): Promise<string> => {
    const connection = await this.database.getConnection()

    try {
      const { eventId, settings } = eventSettings

      await connection.query(
        `INSERT INTO settings (eventId, settings) VALUES (UUID_TO_BIN(?), ?)`,
        [eventId, settings]
      )

      return eventId
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  updateEventSettings = async (eventSettings: IBaseSettings): Promise<void> => {
    const connection = await this.database.getConnection()

    try {
      const { eventId, settings } = eventSettings

      await connection.query(
        'UPDATE settings SET ? WHERE eventId = UUID_TO_BIN(?)',
        [
          {
            settings
          },
          eventId
        ]
      )
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }
}
