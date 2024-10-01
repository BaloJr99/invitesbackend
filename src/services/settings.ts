import { FieldPacket, Pool, RowDataPacket } from 'mysql2/promise'
import { IBaseSettings } from '../interfaces/settingsModel.js'

export class SettingsService {
  constructor(private connection: Pool) {
    this.connection = connection
  }

  getEventSettingsById = async (eventId: string): Promise<IBaseSettings[]> => {
    const [result] = (await this.connection.query(
      'SELECT BIN_TO_UUID(eventId) eventId, settings FROM settings WHERE eventId = UUID_TO_BIN(?)',
      [eventId]
    )) as [RowDataPacket[], FieldPacket[]]

    return result as IBaseSettings[]
  }

  createEventSettings = async (
    eventSettings: IBaseSettings
  ): Promise<string> => {
    const { eventId, settings } = eventSettings

    await this.connection.query(
      `INSERT INTO settings (eventId, settings) VALUES (UUID_TO_BIN(?), ?)`,
      [eventId, settings]
    )

    return eventId
  }

  updateEventSettings = async (eventSettings: IBaseSettings): Promise<void> => {
    const {
      eventId,
      settings
    } = eventSettings

    await this.connection.query(
      'UPDATE settings SET ? WHERE eventId = UUID_TO_BIN(?)',
      [
        {
          settings
        },
        eventId
      ]
    )
  }
}
