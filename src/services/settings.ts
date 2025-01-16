import {
  FieldPacket,
  Pool,
  PoolConnection,
  RowDataPacket
} from 'mysql2/promise'
import { IBaseSettings } from '../interfaces/settingsModel.js'

export class SettingsService {
  constructor(private connection: Pool) {
    this.connection = connection
  }

  getEventSettingsById = async (eventId: string): Promise<IBaseSettings[]> => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

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
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

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
    let connection: PoolConnection | undefined

    try {
      const { eventId, settings } = eventSettings

      connection = await this.connection.getConnection()

      await connection.query('UPDATE settings SET ? WHERE eventId = UUID_TO_BIN(?)', [
        {
          settings
        },
        eventId
      ])
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }
}
