-- Modify "account" table
ALTER TABLE "account" ALTER COLUMN "created_at" DROP DEFAULT;
-- Modify "session" table
ALTER TABLE "session" ALTER COLUMN "created_at" DROP DEFAULT;
-- Modify "user" table
ALTER TABLE "user" ALTER COLUMN "created_at" DROP DEFAULT, ALTER COLUMN "updated_at" DROP DEFAULT;
-- Modify "verification" table
ALTER TABLE "verification" ALTER COLUMN "created_at" DROP DEFAULT, ALTER COLUMN "updated_at" DROP DEFAULT;
