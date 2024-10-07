import { FieldPacket, Pool, QueryResult, RowDataPacket } from 'mysql2/promise'
import {
  EventModel,
  IDashboardEvent,
  IDropdownEvent,
  IEventType,
  IFullEvent,
  IsDeadlineMet,
  IUserEventsInfo
} from '../interfaces/eventsModel.js'
import { IFullInvite } from '../interfaces/invitesModels.js'

export class EventsService {
  constructor(private connection: Pool) {
    this.connection = connection
  }

  getAllEvents = async (): Promise<IDashboardEvent[]> => {
    const [result] = (await this.connection.query(
      'SELECT BIN_TO_UUID(e.id) id, nameOfEvent, dateOfEvent, IF(count(s.eventId) > 0, true, false) AS allowCreateInvites FROM events AS e LEFT JOIN settings AS s ON s.eventId = e.id GROUP BY nameOfEvent, e.id ORDER BY nameOfEvent'
    )) as [RowDataPacket[], FieldPacket[]]

    return result as IDashboardEvent[]
  }

  getEventsByUser = async (userId: string): Promise<IDashboardEvent[]> => {
    const [result] = (await this.connection.query(
      'SELECT BIN_TO_UUID(e.id) id, nameOfEvent, dateOfEvent, IF(count(s.eventId) > 0, true, false) AS allowCreateInvites FROM events AS e LEFT JOIN settings AS s ON s.eventId = e.id WHERE e.userId = CAST(? AS BINARY) GROUP BY nameOfEvent, e.id ORDER BY nameOfEvent',
      [userId]
    )) as [RowDataPacket[], FieldPacket[]]

    return result as IDashboardEvent[]
  }

  getDropdownEvents = async (): Promise<IDropdownEvent[]> => {
    const [result] = (await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, nameOfEvent, typeOfEvent FROM events WHERE dateOfEvent > now() ORDER BY nameOfEvent'
    )) as [RowDataPacket[], FieldPacket[]]

    return result as IDropdownEvent[]
  }

  getEventType = async (eventId: string): Promise<IEventType[]> => {
    const [result] = (await this.connection.query(
      'SELECT typeOfEvent FROM events WHERE id = UUID_TO_BIN(?)',
      [eventId]
    )) as [RowDataPacket[], FieldPacket[]]

    return result as IEventType[]
  }

  getDropdownEventsByUserId = async (
    userId: string
  ): Promise<IDropdownEvent[]> => {
    const [result] = (await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, nameOfEvent, typeOfEvent FROM events WHERE userId = CAST(? AS BINARY) AND dateOfEvent > now() ORDER BY nameOfEvent',
      [userId]
    )) as [RowDataPacket[], FieldPacket[]]

    return result as IDropdownEvent[]
  }

  getEventInvites = async (eventId: string): Promise<IFullInvite[]> => {
    const [result] = (await this.connection.query(
      'SELECT BIN_TO_UUID(inv.id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, kidsAllowed, dateOfConfirmation, isMessageRead, BIN_TO_UUID(inviteGroupId) inviteGroupId, inviteViewed, needsAccomodation FROM invites as inv INNER JOIN events AS ev ON inv.eventId = ev.id WHERE eventId = UUID_TO_BIN(?) ORDER BY dateOfConfirmation DESC',
      [eventId]
    )) as [RowDataPacket[], FieldPacket[]]

    return result as IFullInvite[]
  }

  isDeadlineMet = async (eventId: string): Promise<IsDeadlineMet[]> => {
    const [results] = (await this.connection.query(
      'SELECT IF(dateOfEvent > now(), false, true) AS isDeadlineMet FROM events WHERE id = UUID_TO_BIN(?)',
      [eventId]
    )) as [RowDataPacket[], FieldPacket[]]

    return results as IsDeadlineMet[]
  }

  getEventById = async (eventId: string): Promise<IFullEvent[]> => {
    const [result] = (await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, nameOfEvent, dateOfEvent, maxDateOfConfirmation, nameOfCelebrated, typeOfEvent, CAST(userId AS CHAR) userId FROM events WHERE id = UUID_TO_BIN(?)',
      [eventId]
    )) as [RowDataPacket[], FieldPacket[]]

    return result as IFullEvent[]
  }

  createEvent = async (event: EventModel): Promise<string> => {
    const {
      nameOfEvent,
      dateOfEvent,
      maxDateOfConfirmation,
      userId,
      nameOfCelebrated,
      typeOfEvent
    } = event

    const [queryResult] = await this.connection.query('SELECT UUID() uuid')
    const [{ uuid }] = queryResult as { uuid: string }[]

    await this.connection.query(
      `INSERT INTO events (id, nameOfEvent, dateOfEvent, maxDateOfConfirmation, nameOfCelebrated, typeOfEvent, userId) VALUES (UUID_TO_BIN('${uuid}'), ?, ?, ?, ?, ?, CAST(? AS BINARY))`,
      [
        nameOfEvent,
        dateOfEvent,
        maxDateOfConfirmation,
        nameOfCelebrated,
        typeOfEvent,
        userId
      ]
    )

    return uuid
  }

  deleteEvent = async (eventId: string): Promise<void> => {
    await this.connection.query(
      'DELETE FROM events WHERE id = UUID_TO_BIN(?)',
      [eventId]
    )
  }

  updateEvent = async (
    eventId: string,
    event: EventModel,
    override: boolean
  ): Promise<void> => {
    const {
      nameOfEvent,
      dateOfEvent,
      maxDateOfConfirmation,
      nameOfCelebrated,
      typeOfEvent,
      userId
    } = event

    const actualConnection = await this.connection.getConnection()

    try {
      // Begin transaction with current connection
      await actualConnection.beginTransaction()

      const queryPromises: Promise<[QueryResult, FieldPacket[]]>[] = []

      // Insert query into promise array
      queryPromises.push(
        actualConnection.query(
          'UPDATE events SET ?, userId = CAST(? AS BINARY) WHERE id = UUID_TO_BIN(?)',
          [
            {
              nameOfEvent,
              dateOfEvent,
              maxDateOfConfirmation,
              nameOfCelebrated,
              typeOfEvent
            },
            userId,
            eventId
          ]
        )
      )

      if (override) {
        queryPromises.push(
          actualConnection.query(
            'UPDATE invites SET confirmation = NULL, message = NULL, dateOfConfirmation = NULL, isMessageRead = 0, inviteViewed = 0, needsAccomodation = NULL, entriesConfirmed = NULL WHERE eventId = UUID_TO_BIN(?)',
            [eventId]
          ),
          actualConnection.query(
            'DELETE FROM settings WHERE eventId = UUID_TO_BIN(?)',
            [eventId]
          )
        )
      }

      // Execute all promises
      await Promise.all(queryPromises)

      // Commit transaction
      await actualConnection.commit()
    } catch (err) {
      // Rollback transaction
      await actualConnection.rollback()

      // Release connection
      actualConnection.release()
      return Promise.reject(err)
    }
  }

  getEventsInfo = async (userId: string): Promise<IUserEventsInfo[]> => {
    const [results] = (await this.connection.execute('CALL getEventInfo(?)', [
      userId
    ])) as [RowDataPacket[], FieldPacket[]]

    return results.at(0) as IUserEventsInfo[]
  }
}
