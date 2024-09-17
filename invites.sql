CREATE DATABASE invitesdb;

USE invitesdb;

CREATE TABLE invites (
	id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
	family VARCHAR(255) NOT NULL,
	entriesNumber INT NOT NULL,
	entriesConfirmed BOOLEAN NULL,
	message TEXT,
	confirmation BOOLEAN NULL,
	phoneNumber VARCHAR(13) NOT NULL,
	kidsAllowed BOOLEAN NOT NULL,
  dateOfConfirmation DATETIME,
  isMessageRead BOOLEAN DEFAULT 0,
  eventId BINARY(16) NOT NULL,
  familyGroupId BINARY(16) NOT NULL,
  inviteViewed BOOLEAN DEFAULT 0
);

CREATE TABLE errorLogs (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  dateOfError DATETIME NOT NULL,
  customError TEXT NOT NULL,
  exceptionMessage TEXT NOT NULL,
  userId BINARY(24)
);

CREATE TABLE events (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  nameOfEvent VARCHAR(255) NOT NULL,
  dateOfEvent DATETIME NOT NULL,
  maxDateOfConfirmation DATETIME NOT NULL,
  userId BINARY(24) NOT NULL,
  typeOfEvent CHAR(1) NOT NULL,
  nameOfcelebrated VARCHAR(255) NOT NULL
);

CREATE TABLE familyGroups (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  familyGroup VARCHAR(255) NOT NULL,
  userId BINARY(24) NOT NULL
);

CREATE TABLE inviteImages (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  imageUrl VARCHAR(255) NOT NULL,
  publicId VARCHAR(255) NOT NULL,
  imageUsage CHAR(1) NULL,
  userId BINARY(24) NOT NULL,
  eventId BINARY(16) NOT NULL
);

CREATE TABLE settings (
  eventId BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  primaryColor VARCHAR(7) NOT NULL,
  secondaryColor VARCHAR(7) NOT NULL,
  parents VARCHAR(255) NOT NULL,
  godParents VARCHAR(255) NOT NULL,
  firstSectionSentences TEXT NOT NULL,
  secondSectionSentences TEXT NOT NULL,
  massUrl TEXT NOT NULL,
  massTime TIME NOT NULL,
  massAddress VARCHAR(255) NOT NULL,
  receptionUrl TEXT NOT NULL,
  receptionTime TIME NOT NULL,
  receptionPlace VARCHAR(255) NOT NULL,
  receptionAddress VARCHAR(255) NOT NULL,
  dressCodeColor VARCHAR (255) NOT NULL,
  userId BINARY(24) NOT NULL
);

delimiter //
CREATE PROCEDURE getInvites (IN userIdentifier BINARY(24)) 
BEGIN
	SELECT confirmation, entriesNumber, entriesConfirmed, dateOfConfirmation FROM invites 
    INNER JOIN events ON invites.eventId = events.id
    WHERE userId = userIdentifier
    ORDER BY dateOfConfirmation ASC;
END //
delimiter ;

DROP PROCEDURE IF EXISTS getEventInfo;

delimiter //
CREATE PROCEDURE getEventInfo (IN userIdentifier VARCHAR(24)) 
BEGIN
	SELECT count(DISTINCT ev.nameOfEvent) AS numEvents, count(en.id) AS numEntries FROM events AS ev
	LEFT JOIN invites AS en ON ev.id = en.eventId
	WHERE ev.userId IN (CAST(userIdentifier AS BINARY))
	GROUP BY ev.userId;
END //
delimiter ;