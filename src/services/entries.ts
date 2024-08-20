import { Pool } from "mysql2/promise";
import { ConfirmationModel, PartialEntryModel } from "../interfaces/entriesModels";

export class EntriesService {
  constructor (private connection: Pool) {
    this.connection = connection;
  }

  getAllEntries = async (userId: string) => {
    const [result] = await this.connection.execute('CALL getEntries(CAST(? AS BINARY))', [userId]);
    return result;
  }

  getEntryById = async (id: string) => {
    const [entry] = await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, kidsAllowed, dateOfConfirmation, isMessageRead FROM entries WHERE id = UUID_TO_BIN(?)',
      [id]
    );

    return entry;
  }

  getEntry = async (id: string) => {
    const [result] = await this.connection.query(
      'SELECT BIN_TO_UUID(e.id) id, family, entriesNumber, confirmation, kidsAllowed, ev.dateOfEvent, ev.maxDateOfConfirmation, nameOfCelebrated, typeOfEvent, BIN_TO_UUID(eventId) eventId FROM entries AS e INNER JOIN events as ev ON e.eventId = ev.id WHERE e.id = UUID_TO_BIN(?)',
      [id]
    );

    return result;
  }

  createEntry = async (entry: PartialEntryModel, id: string) => {
    const {
      family,
      entriesNumber,
      phoneNumber,
      kidsAllowed,
      eventId,
      familyGroupId
    } = entry;

    const [queryResult] = await this.connection.query('SELECT UUID() uuid');
    const [{ uuid }] = queryResult as { uuid: string }[];

    await this.connection.query(
      `INSERT INTO entries (id, family, entriesNumber, phoneNumber, kidsAllowed, userId, eventId, familyGroupId) VALUES (UUID_TO_BIN('${uuid}'), ?, ?, ?, ?, CAST(? AS BINARY), UUID_TO_BIN(?), UUID_TO_BIN(?))`,
      [
        family,
        entriesNumber,
        phoneNumber,
        kidsAllowed,
        id,
        eventId,
        familyGroupId
      ]
    );

    return uuid;
  }

  deleteEntry = async (entryId: string) => {
    await this.connection.query('DELETE FROM entries WHERE id = UUID_TO_BIN(?)', [
      entryId
    ]);
  }

  updateEntry = async (entryId: string, entryModel: PartialEntryModel ) => {
    const { family, entriesNumber, phoneNumber, kidsAllowed } = entryModel;

    await this.connection.query(
      'UPDATE entries SET ? WHERE id = UUID_TO_BIN(?)',
      [{ family, entriesNumber, phoneNumber, kidsAllowed }, entryId]
    );
  }

  updateConfirmation = async (entryId: string, confirmations: ConfirmationModel ) => {
    const { entriesConfirmed, message, confirmation, dateOfConfirmation } = confirmations;

    await this.connection.query(
      'UPDATE entries SET ? WHERE id = UUID_TO_BIN(?)',
      [{ entriesConfirmed, message, confirmation, dateOfConfirmation }, entryId]
    );
  }

  readMessage = async (entryId: string) => {
    await this.connection.query(
      'UPDATE entries SET isMessageRead = true WHERE id = UUID_TO_BIN(?)',
      [entryId]
    );
  }

  getUserFromEntryId = async (entryId: string) => {
    const [result] = await this.connection.query(
      'SELECT CAST(userId as CHAR) AS userId FROM entries WHERE id = UUID_TO_BIN(?)',
      [entryId]
    );

    return result;
  }
}