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
  user_id BINARY(16) NOT NULL,
  visitDate DATETIME NOT NULL,
  CONSTRAINT FK_User_Activity FOREIGN KEY (user_id) REFERENCES users(id)
);