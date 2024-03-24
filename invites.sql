CREATE DATABASE invitesdb;

USE invitesdb;

CREATE TABLE entries (
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
  familyGroupId BINARY(16) NOT NULL
);

CREATE TABLE usersActivity (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  controller VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  visitDate DATETIME NOT NULL,
  userId BINARY(24) NOT NULL
);

CREATE TABLE errorLogs (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  dateOfError DATETIME NOT NULL,
  error VARCHAR(255) NOT NULL,
  statusCode VARCHAR(3) NOT NULL
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

delimiter //
CREATE PROCEDURE getEntries (IN userIdentifier BINARY(24)) 
BEGIN
	SELECT confirmation, entriesNumber, entriesConfirmed, dateOfConfirmation  FROM entries WHERE userId = userIdentifier order by dateOfConfirmation ASC;
END //
delimiter ;