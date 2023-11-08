DROP DATABASE IF EXISTS invitesdb;

CREATE DATABASE invitesdb;

USE invitesdb;

DROP TABLE IF EXISTS entries;

CREATE TABLE entries (
	id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
	family VARCHAR(255) NOT NULL,
	entriesNumber INT NOT NULL,
	entriesConfirmed BOOLEAN NULL,
	message TEXT,
	confirmation BOOLEAN NULL,
	phoneNumber VARCHAR(13) NOT NULL,
	groupSelected VARCHAR(20) NOT NULL,
	kidsAllowed BOOLEAN NOT NULL
);

CREATE TABLE usersActivity (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  controller VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  user_id BINARY(24) NOT NULL,
  visitDate DATETIME NOT NULL
);

ALTER TABLE entries ADD COLUMN userId BINARY(24);
UPDATE entries SET userId = CAST('653db741413356d785873257' AS BINARY);
ALTER TABLE entries MODIFY COLUMN userId BINARY(24) NOT NULL;

ALTER TABLE usersActivity RENAME COLUMN user_id to userId;

CREATE TABLE errorLogs (
  id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
  dateOfError DATETIME NOT NULL,
  error VARCHAR(255) NOT NULL,
  statusCode VARCHAR(3) NOT NULL
);

ALTER TABLE entries ADD COLUMN dateOfConfirmation DATETIME;
UPDATE entries SET dateOfConfirmation = '1000-01-01 00:00:00';
ALTER TABLE entries ADD COLUMN isMessageRead BOOLEAN;
UPDATE entries SET isMessageRead = true;