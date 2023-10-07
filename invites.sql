DROP DATABASE IF EXISTS invitesdb;

CREATE DATABASE invitesdb;

USE invitesdb;

CREATE TABLE entries (
	id BINARY(16) PRIMARY KEY DEFAULT (UUID_TO_BIN(UUID())),
	family VARCHAR(255) NOT NULL,
	entriesNumber INT NOT NULL,
	message TEXT,
	confirmation BIT
);