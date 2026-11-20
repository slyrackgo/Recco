-- Run once against the existing PostgreSQL database to allow long recommendation text.
ALTER TABLE user_interests
    ALTER COLUMN title TYPE TEXT,
    ALTER COLUMN description TYPE TEXT;
