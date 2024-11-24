import { FieldPacket, Pool, RowDataPacket } from 'mysql2/promise'
import { IBaseSettings } from '../interfaces/settingsModel.js'

export class SettingsService {
  constructor(private connection: Pool) {
    this.connection = connection
  }

  getEventSettingsById = async (eventId: string): Promise<IBaseSettings[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [result] = (await conn.query(
        'SELECT BIN_TO_UUID(eventId) eventId, settings FROM settings WHERE eventId = UUID_TO_BIN(?)',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      conn.release()
      return result as IBaseSettings[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  createEventSettings = async (
    eventSettings: IBaseSettings
  ): Promise<string> => {
    try {
      const conn = await this.connection.getConnection()

      const { eventId, settings } = eventSettings

      await conn.query(
        `INSERT INTO settings (eventId, settings) VALUES (UUID_TO_BIN(?), ?)`,
        [eventId, settings]
      )

      conn.release()
      return eventId
    } catch (error) {
      return Promise.reject(error)
    }
  }

  updateEventSettings = async (eventSettings: IBaseSettings): Promise<void> => {
    try {
      const { eventId, settings } = eventSettings

      const conn = await this.connection.getConnection()

      await conn.query('UPDATE settings SET ? WHERE eventId = UUID_TO_BIN(?)', [
        {
          settings
        },
        eventId
      ])

      conn.release()
    } catch (error) {
      console.error(error)
    }
  }
}
