import { Pool } from "mysql2/promise";
import { EventModel } from "../interfaces/eventsModel";

export class EventsService {
  constructor (private connection: Pool) {
    this.connection = connection;
  }

  getEvents = async (userId: string) => {
    const [result] = await this.connection.query(
      'SELECT BIN_TO_UUID(e.id) id, nameOfEvent, dateOfEvent, maxDateOfConfirmation, IF(count(s.eventId) > 0, true, false) AS allowCreateEntries FROM events AS e LEFT JOIN settings AS s ON s.eventId = e.id WHERE e.userId = CAST(? AS BINARY) GROUP BY nameOfEvent, e.id ORDER BY nameOfEvent',
      [userId]
    );

    return result;
  }

  getEventEntries = async (userId: string, eventId: string) => {
    const [result] = await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, kidsAllowed, dateOfConfirmation, isMessageRead, BIN_TO_UUID(familyGroupId) familyGroupId FROM entries WHERE userId = CAST(? AS BINARY) AND eventId = UUID_TO_BIN(?) ORDER BY dateOfConfirmation DESC',
      [userId, eventId]
    );
    return result;
  }

  getEventById = async (eventId: string) => {
    const [result] = await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, nameOfEvent, dateOfEvent, maxDateOfConfirmation FROM events WHERE id = UUID_TO_BIN(?)',
      [eventId]
    );

    return result;
  }

  createEvent = async (event: EventModel, id: string) => {
    const { nameOfEvent, dateOfEvent, maxDateOfConfirmation } = event;

    const [queryResult] = await this.connection.query('SELECT UUID() uuid');
    const [{ uuid }] = queryResult as { uuid: string }[];

    await this.connection.query(
      `INSERT INTO events (id, nameOfEvent, dateOfEvent, maxDateOfConfirmation, userId) VALUES (UUID_TO_BIN('${uuid}'), ?, ?, ?, CAST(? AS BINARY))`,
      [nameOfEvent, dateOfEvent, maxDateOfConfirmation, id]
    );

    return uuid;
  }

  deleteEvent = async (eventId: string) => {
    await this.connection.query('DELETE FROM events WHERE id = UUID_TO_BIN(?)', [
      eventId
    ]);
  }

  updateEvent = async (eventId: string, event: EventModel) => {
    const { nameOfEvent, dateOfEvent, maxDateOfConfirmation } = event;

    await this.connection.query(
      'UPDATE events SET ? WHERE id = UUID_TO_BIN(?)',
      [{ nameOfEvent, dateOfEvent, maxDateOfConfirmation }, eventId]
    )
  }
}
