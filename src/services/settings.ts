import { Pool } from "mysql2/promise";
import { SettingsModel } from "../interfaces/settingsModel.js";

export class SettingsService {
  constructor (private connection: Pool) {
    this.connection = connection;
  }

  getEventSettingsById = async (eventId: string) => {
    const [result] = await this.connection.query(
      'SELECT BIN_TO_UUID(eventId) eventId, primaryColor, secondaryColor, parents, godParents, firstSectionSentences, secondSectionSentences, massUrl, massTime, massAddress, receptionUrl, receptionTime, receptionPlace, receptionAddress, dressCodeColor FROM settings WHERE eventId = UUID_TO_BIN(?)',
      [eventId]
    );

    return result;
  }

  createEventSettings = async (eventSettings: SettingsModel) => {
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
      `INSERT INTO settings (eventId, primaryColor, secondaryColor, parents, godParents, firstSectionSentences, secondSectionSentences, massUrl, massTime, massAddress, receptionUrl, receptionTime, receptionPlace, receptionAddress, dressCodeColor) VALUES (UUID_TO_BIN('${eventId}'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [primaryColor, secondaryColor, parents, godParents, firstSectionSentences, secondSectionSentences, massUrl, massTime, massAddress, receptionUrl, receptionTime, receptionPlace, receptionAddress, dressCodeColor]
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
