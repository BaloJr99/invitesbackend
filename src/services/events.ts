import { FieldPacket, Pool, QueryResult, RowDataPacket } from 'mysql2/promise'
import {
  EventModel,
  IDashboardEvent,
  IDropdownEvent,
  IEventInformation,
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
    try {
      const conn = await this.connection.getConnection()

      const [result] = (await conn.query(
        'SELECT BIN_TO_UUID(e.id) id, nameOfEvent, dateOfEvent, IF(count(s.eventId) > 0, true, false) AS allowCreateInvites FROM events AS e LEFT JOIN settings AS s ON s.eventId = e.id GROUP BY nameOfEvent, e.id ORDER BY nameOfEvent'
      )) as [RowDataPacket[], FieldPacket[]]

      conn.destroy()
      return result as IDashboardEvent[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getEventsByUser = async (userId: string): Promise<IDashboardEvent[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [result] = (await conn.query(
        'SELECT BIN_TO_UUID(e.id) id, nameOfEvent, dateOfEvent, IF(count(s.eventId) > 0, true, false) AS allowCreateInvites FROM events AS e LEFT JOIN settings AS s ON s.eventId = e.id WHERE e.userId = CAST(? AS BINARY) GROUP BY nameOfEvent, e.id ORDER BY nameOfEvent',
        [userId]
      )) as [RowDataPacket[], FieldPacket[]]

      conn.destroy()
      return result as IDashboardEvent[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getDropdownEvents = async (): Promise<IDropdownEvent[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [result] = (await conn.query(
        'SELECT BIN_TO_UUID(id) id, nameOfEvent, typeOfEvent FROM events WHERE dateOfEvent > now() ORDER BY nameOfEvent'
      )) as [RowDataPacket[], FieldPacket[]]

      conn.destroy()
      return result as IDropdownEvent[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  eventInformation = async (eventId: string): Promise<IEventInformation[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [result] = (await conn.query(
        'SELECT typeOfEvent, settings FROM events AS e INNER JOIN settings AS s ON e.id = s.eventId WHERE id = UUID_TO_BIN(?)',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      conn.destroy()
      return result as IEventInformation[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getDropdownEventsByUserId = async (
    userId: string
  ): Promise<IDropdownEvent[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [result] = (await conn.query(
        'SELECT BIN_TO_UUID(id) id, nameOfEvent, typeOfEvent FROM events WHERE userId = CAST(? AS BINARY) AND dateOfEvent > now() ORDER BY nameOfEvent',
        [userId]
      )) as [RowDataPacket[], FieldPacket[]]

      conn.destroy()
      return result as IDropdownEvent[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getEventInvites = async (eventId: string): Promise<IFullInvite[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [result] = (await conn.query(
        'SELECT BIN_TO_UUID(inv.id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, kidsAllowed, dateOfConfirmation, isMessageRead, BIN_TO_UUID(inviteGroupId) inviteGroupId, inviteViewed, needsAccomodation FROM invites as inv INNER JOIN events AS ev ON inv.eventId = ev.id WHERE eventId = UUID_TO_BIN(?) ORDER BY dateOfConfirmation DESC',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      conn.destroy()
      return result as IFullInvite[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  isDeadlineMet = async (eventId: string): Promise<IsDeadlineMet[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [results] = (await conn.query(
        'SELECT IF(dateOfEvent > now(), false, true) AS isDeadlineMet FROM events WHERE id = UUID_TO_BIN(?)',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      conn.destroy()
      return results as IsDeadlineMet[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  getEventById = async (eventId: string): Promise<IFullEvent[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [result] = (await conn.query(
        'SELECT BIN_TO_UUID(id) id, nameOfEvent, dateOfEvent, maxDateOfConfirmation, nameOfCelebrated, typeOfEvent, CAST(userId AS CHAR) userId FROM events WHERE id = UUID_TO_BIN(?)',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      conn.destroy()
      return result as IFullEvent[]
    } catch (error) {
      return Promise.reject(error)
    }
  }

  createEvent = async (event: EventModel): Promise<string> => {
    try {
      const {
        nameOfEvent,
        dateOfEvent,
        maxDateOfConfirmation,
        userId,
        nameOfCelebrated,
        typeOfEvent
      } = event

      const conn = await this.connection.getConnection()

      const [queryResult] = await conn.query('SELECT UUID() uuid')
      const [{ uuid }] = queryResult as { uuid: string }[]

      await conn.query(
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

      conn.destroy()
      return uuid
    } catch (error) {
      return Promise.reject(error)
    }
  }

  deleteEvent = async (eventId: string): Promise<void> => {
    try {
      const conn = await this.connection.getConnection()

      await conn.query('DELETE FROM events WHERE id = UUID_TO_BIN(?)', [
        eventId
      ])

      conn.destroy()
    } catch (error) {
      console.error(error)
    }
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

      // Release connection
      actualConnection.release()
    } catch (error) {
      console.error(error)
      // Rollback transaction
      await actualConnection.rollback()

      // Release connection
      actualConnection.release()
    }
  }

  getEventsInfo = async (userId: string): Promise<IUserEventsInfo[]> => {
    try {
      const conn = await this.connection.getConnection()

      const [results] = (await conn.execute('CALL getEventInfo(?)', [
        userId
      ])) as [RowDataPacket[], FieldPacket[]]

      conn.destroy()
      return results.at(0) as IUserEventsInfo[]
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
