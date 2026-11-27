-- One row per day. A day's hearts are likes - unlikes (a reader can take a like back).
CREATE TABLE IF NOT EXISTS hearts (
	day TEXT PRIMARY KEY,
	likes INTEGER NOT NULL DEFAULT 0,
	unlikes INTEGER NOT NULL DEFAULT 0
);
