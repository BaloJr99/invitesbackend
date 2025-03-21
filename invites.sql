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
  inviteGroupId BINARY(16) NOT NULL,
  inviteViewed BOOLEAN DEFAULT 0,
  lastViewedDate DATETIME NULL,
  needsAccomodation BOOLEAN NULL,
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
  dateOfEvent DATE NOT NULL,
  maxDateOfConfirmation DATETIME NOT NULL,
  userId BINARY(24) NOT NULL,
  typeOfEvent CHAR(1) NOT NULL,
  nameOfcelebrated VARCHAR(255) NOT NULL
);

CREATE TABLE inviteGroups (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  inviteGroup VARCHAR(255) NOT NULL,
  userId BINARY(24) NOT NULL
);

CREATE TABLE inviteImages (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  fileUrl VARCHAR(255) NOT NULL,
  publicId VARCHAR(255) NOT NULL,
  imageUsage CHAR(1) NULL,
  eventId BINARY(16) NOT NULL
);

CREATE TABLE invitesAudio (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  fileUrl VARCHAR(255) NOT NULL,
  publicId VARCHAR(255) NOT NULL,
  eventId BINARY(16) NOT NULL
);

CREATE TABLE settings (
  eventId BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  settings TEXT NOT NULL
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

DROP PROCEDURE IF EXISTS cleanEnvironment;

delimiter //
CREATE PROCEDURE cleanEnvironment () 
BEGIN
  DELETE FROM invites;
  DELETE FROM events;
  DELETE FROM invitegroups;
  DELETE FROM inviteimages;
  DELETE FROM invitesaudio;
  DELETE FROM settings;
END //
delimiter ;

CREATE TABLE albums (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  nameOfAlbum VARCHAR(255) NOT NULL,
  dateOfAlbum DATETIME NOT NULL,
  eventId BINARY(16) NOT NULL,
  isActive BOOLEAN DEFAULT 1
);

CREATE TABLE albumImages (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  fileUrl VARCHAR(255) NOT NULL,
  publicId VARCHAR(255) NOT NULL,
  albumId BINARY(16) NOT NULL,
  isActive BOOLEAN DEFAULT 1
);