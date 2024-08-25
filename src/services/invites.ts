import { Pool } from "mysql2/promise";
import { ConfirmationModel, PartialInviteModel } from "../interfaces/invitesModels";

export class InvitesService {
  constructor (private connection: Pool) {
    this.connection = connection;
  }

  getAllInvites = async (userId: string) => {
    const [result] = await this.connection.execute('CALL getInvites(CAST(? AS BINARY))', [userId]);
    return result;
  }

  getInviteById = async (id: string) => {
    const [invite] = await this.connection.query(
      'SELECT BIN_TO_UUID(id) id, family, entriesNumber, message, confirmation, phoneNumber, entriesConfirmed, kidsAllowed, dateOfConfirmation, isMessageRead FROM invites WHERE id = UUID_TO_BIN(?)',
      [id]
    );

    return invite;
  }

  getInvite = async (id: string) => {
    const [result] = await this.connection.query(
      'SELECT BIN_TO_UUID(e.id) id, family, entriesNumber, confirmation, kidsAllowed, ev.dateOfEvent, ev.maxDateOfConfirmation, nameOfCelebrated, typeOfEvent, BIN_TO_UUID(eventId) eventId FROM invites AS e INNER JOIN events as ev ON e.eventId = ev.id WHERE e.id = UUID_TO_BIN(?)',
      [id]
    );

    return result;
  }

  createInvite = async (invite: PartialInviteModel, id: string) => {
    const {
      family,
      entriesNumber,
      phoneNumber,
      kidsAllowed,
      eventId,
      familyGroupId
    } = invite;

    const [queryResult] = await this.connection.query('SELECT UUID() uuid');
    const [{ uuid }] = queryResult as { uuid: string }[];

    await this.connection.query(
      `INSERT INTO invites (id, family, entriesNumber, phoneNumber, kidsAllowed, userId, eventId, familyGroupId) VALUES (UUID_TO_BIN('${uuid}'), ?, ?, ?, ?, CAST(? AS BINARY), UUID_TO_BIN(?), UUID_TO_BIN(?))`,
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

  

  createBulkInvite = async (invites: PartialInviteModel[], id: string) => {
    invites.forEach(async invite => {
      await this.connection.query(
        `INSERT INTO invites (id, family, entriesNumber, phoneNumber, kidsAllowed, userId, eventId, familyGroupId) VALUES (UUID_TO_BIN('${crypto.randomUUID()}'), ?, ?, ?, ?, CAST(? AS BINARY), UUID_TO_BIN(?), UUID_TO_BIN(?))`,
        [
          invite.family,
          invite.entriesNumber,
          invite.phoneNumber,
          invite.kidsAllowed,
          id,
          invite.eventId,
          invite.familyGroupId
        ]
      );
    })
  }

  deleteInvite = async (inviteId: string) => {
    await this.connection.query('DELETE FROM invites WHERE id = UUID_TO_BIN(?)', [
      inviteId
    ]);
  }

  updateInvite = async (inviteId: string, entryModel: PartialInviteModel ) => {
    const { family, entriesNumber, phoneNumber, kidsAllowed } = entryModel;

    await this.connection.query(
      'UPDATE invites SET ? WHERE id = UUID_TO_BIN(?)',
      [{ family, entriesNumber, phoneNumber, kidsAllowed }, inviteId]
    );
  }

  updateConfirmation = async (inviteId: string, confirmations: ConfirmationModel ) => {
    const { entriesConfirmed, message, confirmation, dateOfConfirmation } = confirmations;

    await this.connection.query(
      'UPDATE invites SET ? WHERE id = UUID_TO_BIN(?)',
      [{ entriesConfirmed, message, confirmation, dateOfConfirmation }, inviteId]
    );
  }

  readMessage = async (inviteId: string) => {
    await this.connection.query(
      'UPDATE invites SET isMessageRead = true WHERE id = UUID_TO_BIN(?)',
      [inviteId]
    );
  }

  getUserFromInviteId = async (inviteId: string) => {
    const [result] = await this.connection.query(
      'SELECT CAST(userId as CHAR) AS userId FROM invites WHERE id = UUID_TO_BIN(?)',
      [inviteId]
    );

    return result;
  }
}