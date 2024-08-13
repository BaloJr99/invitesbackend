import { Pool } from "mysql2/promise";
import { SettingsModel } from "../interfaces/settingsModel";

export class EventSettingsService {
  constructor (private connection: Pool) {
    this.connection = connection;
  }

  getEventSettingsById = async (eventId: string) => {
    const [result] = await this.connection.query(
      'SELECT BIN_TO_UUID(eventId) eventId, primaryColor, secondaryColor, parents, godParents, firstSectionSentences, secondSectionSentences, massUrl, massTime, massAddress, receptionUrl, receptionTime, receptionPlace, receptionAddress, dressCodeColor, CAST(userId AS CHAR) AS userId FROM settings WHERE eventId = UUID_TO_BIN(?)',
      [eventId]
    );

    return result;
  }

  createEventSettings = async (eventSettings: SettingsModel, userId: string) => {
    const { 
      eventId,
      primaryColor,
      secondaryColor,
      parents,
      godParents,
      firstSectionSentences,
      secondSectionSentences,
      massUrl,
      massTime,
      massAddress,
      receptionUrl,
      receptionTime,
      receptionPlace,
      receptionAddress,
      dressCodeColor
    } = eventSettings;

    await this.connection.query(
      `INSERT INTO settings (eventId, primaryColor, secondaryColor, parents, godParents, firstSectionSentences, secondSectionSentences, massUrl, massTime, massAddress, receptionUrl, receptionTime, receptionPlace, receptionAddress, dressCodeColor, userId) VALUES (UUID_TO_BIN('${eventId}'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS BINARY))`,
      [primaryColor, secondaryColor, parents, godParents, firstSectionSentences, secondSectionSentences, massUrl, massTime, massAddress, receptionUrl, receptionTime, receptionPlace, receptionAddress, dressCodeColor, userId]
    );

    return eventId;
  }

  updateEventSettings = async (eventId: string, eventSettings: SettingsModel) => {
    const { 
      primaryColor,
      secondaryColor,
      parents,
      godParents,
      firstSectionSentences,
      secondSectionSentences,
      massUrl,
      massTime,
      massAddress,
      receptionUrl,
      receptionTime,
      receptionPlace,
      receptionAddress,
      dressCodeColor,
     } = eventSettings;

    await this.connection.query(
      'UPDATE settings SET ? WHERE eventId = UUID_TO_BIN(?)',
      [
        { 
          primaryColor,
          secondaryColor,
          parents,
          godParents,
          firstSectionSentences,
          secondSectionSentences,
          massUrl,
          massTime,
          massAddress,
          receptionUrl,
          receptionTime,
          receptionPlace,
          receptionAddress,
          dressCodeColor 
        }, eventId
      ]
    )
  }
}
