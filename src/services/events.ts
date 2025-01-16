import { FieldPacket, Pool, PoolConnection, QueryResult, RowDataPacket } from 'mysql2/promise'
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
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()
      const [result] = (await connection.query(
        'SELECT BIN_TO_UUID(e.id) id, nameOfEvent, dateOfEvent, IF(count(s.eventId) > 0, true, false) AS allowCreateInvites FROM events AS e LEFT JOIN settings AS s ON s.eventId = e.id GROUP BY nameOfEvent, e.id ORDER BY nameOfEvent'
      )) as [RowDataPacket[], FieldPacket[]]

      return result as IDashboardEvent[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  getEventsByUser = async (userId: string): Promise<IDashboardEvent[]> => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

      const [result] = (await connection.query(
        'SELECT BIN_TO_UUID(e.id) id, nameOfEvent, dateOfEvent, IF(count(s.eventId) > 0, true, false) AS allowCreateInvites FROM events AS e LEFT JOIN settings AS s ON s.eventId = e.id WHERE e.userId = CAST(? AS BINARY) GROUP BY nameOfEvent, e.id ORDER BY nameOfEvent',
        [userId]
      )) as [RowDataPacket[], FieldPacket[]]

      return result as IDashboardEvent[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  getDropdownEvents = async (): Promise<IDropdownEvent[]> => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

      const [result] = (await connection.query(
        'SELECT BIN_TO_UUID(id) id, nameOfEvent, typeOfEvent FROM events WHERE dateOfEvent > now() ORDER BY nameOfEvent'
      )) as [RowDataPacket[], FieldPacket[]]

      return result as IDropdownEvent[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  eventInformation = async (eventId: string): Promise<IEventInformation[]> => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

      const [result] = (await connection.query(
        'SELECT typeOfEvent, settings FROM events AS e LEFT JOIN settings AS s ON e.id = s.eventId WHERE id = UUID_TO_BIN(?)',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      return result as IEventInformation[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  getDropdownEventsByUserId = async (
    userId: string
  ): Promise<IDropdownEvent[]> => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

      const [result] = (await connection.query(
        'SELECT BIN_TO_UUID(id) id, nameOfEvent, typeOfEvent FROM events WHERE userId = CAST(? AS BINARY) AND dateOfEvent > now() ORDER BY nameOfEvent',
        [userId]
      )) as [RowDataPacket[], FieldPacket[]]

      return result as IDropdownEvent[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  getEventInvites = async (eventId: string): Promise<IFullInvite[]> => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

      const [result] = (await connection.query(
        'SELECT BIN_TO_UUID(inv.id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, kidsAllowed, dateOfConfirmation, isMessageRead, BIN_TO_UUID(inviteGroupId) inviteGroupId, inviteViewed, needsAccomodation FROM invites as inv INNER JOIN events AS ev ON inv.eventId = ev.id WHERE eventId = UUID_TO_BIN(?) ORDER BY dateOfConfirmation DESC',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      return result as IFullInvite[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  isDeadlineMet = async (eventId: string): Promise<IsDeadlineMet[]> => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

      const [results] = (await connection.query(
        'SELECT IF(dateOfEvent > now(), false, true) AS isDeadlineMet FROM events WHERE id = UUID_TO_BIN(?)',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      return results as IsDeadlineMet[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  getEventById = async (eventId: string): Promise<IFullEvent[]> => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

      const [result] = (await connection.query(
        'SELECT BIN_TO_UUID(id) id, nameOfEvent, dateOfEvent, maxDateOfConfirmation, nameOfCelebrated, typeOfEvent, CAST(userId AS CHAR) userId FROM events WHERE id = UUID_TO_BIN(?)',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      return result as IFullEvent[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  createEvent = async (event: EventModel): Promise<string> => {
    let connection: PoolConnection | undefined

    try {
      const {
        nameOfEvent,
        dateOfEvent,
        maxDateOfConfirmation,
        userId,
        nameOfCelebrated,
        typeOfEvent
      } = event

      connection = await this.connection.getConnection()

      const [queryResult] = await connection.query('SELECT UUID() uuid')
      const [{ uuid }] = queryResult as { uuid: string }[]

      await connection.query(
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
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  deleteEvent = async (eventId: string): Promise<void> => {
    let connection: PoolConnection | undefined

    try {
      connection = await this.connection.getConnection()

      await connection.query('DELETE FROM events WHERE id = UUID_TO_BIN(?)', [
        eventId
      ])
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }

  updateEvent = async (
    eventId: string,
    event: EventModel,
    override: boolean,
    overrideViewed: boolean
  ): Promise<void> => {
    let connection: PoolConnection | undefined

    const {
      nameOfEvent,
      dateOfEvent,
      maxDateOfConfirmation,
      nameOfCelebrated,
      typeOfEvent,
      userId
    } = event

    try {
      connection = await this.connection.getConnection()

      // Begin transaction with current connection
      await connection.beginTransaction()

      const queryPromises: Promise<[QueryResult, FieldPacket[]]>[] = []

      // Insert query into promise array
      queryPromises.push(
        connection.query(
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
          connection.query(
            'UPDATE invites SET confirmation = NULL, message = NULL, dateOfConfirmation = NULL, isMessageRead = 0, inviteViewed = 0, needsAccomodation = NULL, entriesConfirmed = NULL WHERE eventId = UUID_TO_BIN(?)',
            [eventId]
          ),
          connection.query(
            'DELETE FROM settings WHERE eventId = UUID_TO_BIN(?)',
            [eventId]
          )
        )
      } else if (overrideViewed) {
        queryPromises.push(
          connection.query(
            'UPDATE invites SET inviteViewed = 0 WHERE eventId = UUID_TO_BIN(?)',
            [eventId]
          )
        )
      }

      // Execute all promises
      await Promise.all(queryPromises)

      // Commit transaction
      await connection.commit()

      // Release connection
      connection.release()
    } catch (error) {
      console.error(error)
      // Rollback transaction
      if (connection) await connection.rollback()
    } finally {
      if (connection) connection.release()
    }
  }

  getEventsInfo = async (userId: string): Promise<IUserEventsInfo[]> => {
    let connection: PoolConnection | undefined
    
    try {
      connection = await this.connection.getConnection()

      const [results] = (await connection.execute('CALL getEventInfo(?)', [
        userId
      ])) as [RowDataPacket[], FieldPacket[]]

      return results.at(0) as IUserEventsInfo[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }
}
