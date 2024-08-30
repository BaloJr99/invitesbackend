import { FieldPacket, Pool, RowDataPacket } from "mysql2/promise";
import { EventModel } from "../interfaces/eventsModel";
import { EventsInfoModel } from "../interfaces/usersModel";

export class EventsService {
  constructor (private connection: Pool) {
    this.connection = connection;
  }

  getAllEvents = async () => {
    const [result] = await this.connection.query(
      'SELECT BIN_TO_UUID(e.id) id, nameOfEvent, dateOfEvent, IF(count(s.eventId) > 0, true, false) AS allowCreateInvites FROM events AS e LEFT JOIN settings AS s ON s.eventId = e.id GROUP BY nameOfEvent, e.id ORDER BY nameOfEvent',
    );

    return result;
  }

  getEventsByUser = async (userId: string) => {
    const [result] = await this.connection.query(
      'SELECT BIN_TO_UUID(e.id) id, nameOfEvent, dateOfEvent, IF(count(s.eventId) > 0, true, false) AS allowCreateInvites FROM events AS e LEFT JOIN settings AS s ON s.eventId = e.id WHERE e.userId = CAST(? AS BINARY) GROUP BY nameOfEvent, e.id ORDER BY nameOfEvent',
      [userId]
    );

    return result;
  }

  getDropdownEvents = async () => {
    const [result] = await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, nameOfEvent FROM events WHERE dateOfEvent > now() ORDER BY nameOfEvent',
    );

    return result;
  }

  getDropdownEventsByUserId = async (userId: string) => {
    const [result] = await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, nameOfEvent FROM events WHERE userId = CAST(? AS BINARY) AND dateOfEvent > now() ORDER BY nameOfEvent',
      [ userId ]
    );

    return result;
  }

  getEventInvites = async (eventId: string) => {
    const [result] = await this.connection.query(
      'SELECT BIN_TO_UUID(inv.id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, kidsAllowed, dateOfConfirmation, isMessageRead, BIN_TO_UUID(familyGroupId) familyGroupId, IF(ev.dateOfEvent >= NOW(), true, false) AS isDeadlineMet FROM invites as inv INNER JOIN events AS ev ON inv.eventId = ev.id WHERE eventId = UUID_TO_BIN(?) ORDER BY dateOfConfirmation DESC',
      [eventId]
    );
    return result;
  }

  getEventById = async (eventId: string) => {
    const [result] = await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, nameOfEvent, dateOfEvent, maxDateOfConfirmation, nameOfCelebrated, typeOfEvent, CAST(userId AS CHAR) userId FROM events WHERE id = UUID_TO_BIN(?)',
      [eventId]
    );

    return result;
  }

  createEvent = async (event: EventModel) => {
    const { nameOfEvent, dateOfEvent, maxDateOfConfirmation, userId, nameOfCelebrated, typeOfEvent} = event;

    const [queryResult] = await this.connection.query('SELECT UUID() uuid');
    const [{ uuid }] = queryResult as { uuid: string }[];

    await this.connection.query(
      `INSERT INTO events (id, nameOfEvent, dateOfEvent, maxDateOfConfirmation, nameOfCelebrated, typeOfEvent, userId) VALUES (UUID_TO_BIN('${uuid}'), ?, ?, ?, ?, ?, CAST(? AS BINARY))`,
      [nameOfEvent, dateOfEvent, maxDateOfConfirmation, nameOfCelebrated, typeOfEvent, userId]
    );

    return uuid;
  }

  deleteEvent = async (eventId: string) => {
    await this.connection.query('DELETE FROM events WHERE id = UUID_TO_BIN(?)', [
      eventId
    ]);
  }

  updateEvent = async (eventId: string, event: EventModel) => {
    const { nameOfEvent, dateOfEvent, maxDateOfConfirmation, nameOfCelebrated, typeOfEvent, userId } = event;

    await this.connection.query(
      'UPDATE events SET ?, userId = CAST(? AS BINARY) WHERE id = UUID_TO_BIN(?)',
      [ { nameOfEvent, dateOfEvent, maxDateOfConfirmation, nameOfCelebrated, typeOfEvent }, userId, eventId]
    )
  }

  getEventsInfo = async (userId: string) => {
    const [results] = (await this.connection.execute(
      'CALL getEventInfo(?)', [userId]
    )) as [RowDataPacket[], FieldPacket[]];

    return results.at(0) as EventsInfoModel[];
  }
}
