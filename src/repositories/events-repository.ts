import { FieldPacket, QueryResult, RowDataPacket } from 'mysql2/promise'
import { MysqlDatabase } from '../services/mysql-database.js'
import { IEventsRepository } from '../interfaces/events-repository.js'
import {
  IDashboardEvent,
  IDropdownEvent,
  IEventInformation,
  IsDeadlineMet,
  EventModel,
  IFullEvent,
  IFullInvite,
  IUserEventsInfo
} from '../global/types.js'

export class EventsRepository implements IEventsRepository {
  constructor(private database: MysqlDatabase) {
    this.database = database
  }

  async getAllEvents(): Promise<IDashboardEvent[]> {
    const connection = await this.database.getConnection()

    try {
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

  async getEventsByUser(userId: string): Promise<IDashboardEvent[]> {
    const connection = await this.database.getConnection()

    try {
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

  async getDropdownEvents(): Promise<IDropdownEvent[]> {
    const connection = await this.database.getConnection()

    try {
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

  async getEventId(nameOfEvent: string): Promise<string> {
    const connection = await this.database.getConnection()

    try {
      const [results] = (await connection.query(
        'SELECT BIN_TO_UUID(id) as eventId FROM events WHERE nameOfEvent = ?',
        [nameOfEvent]
      )) as [RowDataPacket[], FieldPacket[]]

      if (results.length === 0) return ''

      return results[0].eventId
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  async isActive(nameOfEvent: string): Promise<boolean> {
    const connection = await this.database.getConnection()

    try {
      const [results] = (await connection.query(
        'SELECT IF(utc_date() >= DATE(dateOfEvent), true, false) AS isActive FROM events WHERE nameOfEvent = ?',
        [nameOfEvent]
      )) as [RowDataPacket[], FieldPacket[]]

      if (results.length === 0) return false

      return Boolean(results[0].isActive)
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  async eventInformation(eventId: string): Promise<IEventInformation[]> {
    const connection = await this.database.getConnection()

    try {
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

  async getDropdownEventsByUserId(userId: string): Promise<IDropdownEvent[]> {
    const connection = await this.database.getConnection()

    try {
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

  async getEventInvites(eventId: string): Promise<IFullInvite[]> {
    const connection = await this.database.getConnection()

    try {
      const [result] = (await connection.query(
        'SELECT BIN_TO_UUID(inv.id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, kidsAllowed, dateOfConfirmation, isMessageRead, BIN_TO_UUID(inviteGroupId) inviteGroupId, BIN_TO_UUID(eventId) eventId, inviteViewed, needsAccomodation FROM invites as inv INNER JOIN events AS ev ON inv.eventId = ev.id WHERE eventId = UUID_TO_BIN(?) ORDER BY dateOfConfirmation DESC',
        [eventId]
      )) as [RowDataPacket[], FieldPacket[]]

      return result as IFullInvite[]
    } catch (error) {
      return Promise.reject(error)
    } finally {
      if (connection) connection.release()
    }
  }

  async isDeadlineMet(eventId: string): Promise<IsDeadlineMet[]> {
    const connection = await this.database.getConnection()

    try {
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

  async getEventById(eventId: string): Promise<IFullEvent[]> {
    const connection = await this.database.getConnection()

    try {
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

  async createEvent(event: EventModel): Promise<string> {
    const connection = await this.database.getConnection()

    try {
      const {
        nameOfEvent,
        dateOfEvent,
        maxDateOfConfirmation,
        userId,
        nameOfCelebrated,
        typeOfEvent
      } = event

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

  async deleteEvent(eventId: string): Promise<void> {
    const connection = await this.database.getConnection()

    try {
      await connection.query('DELETE FROM events WHERE id = UUID_TO_BIN(?)', [
        eventId
      ])
    } catch (error) {
      console.error(error)
    } finally {
      if (connection) connection.release()
    }
  }

  async updateEvent(
    eventId: string,
    event: EventModel,
    override: boolean,
    overrideViewed: boolean
  ): Promise<void> {
    const connection = await this.database.getConnection()

    const {
      nameOfEvent,
      dateOfEvent,
      maxDateOfConfirmation,
      nameOfCelebrated,
      typeOfEvent,
      userId
    } = event

    try {
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

  async getEventsInfo(userId: string): Promise<IUserEventsInfo[]> {
    const connection = await this.database.getConnection()

    try {
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
