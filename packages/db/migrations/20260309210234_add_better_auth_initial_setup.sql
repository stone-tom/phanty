-- Create "user" table
CREATE TABLE "user" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "email_verified" boolean NOT NULL DEFAULT false,
  "image" text NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "user_email_unique" UNIQUE ("email")
);
-- Create "verification" table
CREATE TABLE "verification" (
  "id" text NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);
-- Create index "verification_identifier_idx" to table: "verification"
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");
-- Create "account" table
CREATE TABLE "account" (
  "id" text NOT NULL,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "user_id" text NOT NULL,
  "access_token" text NULL,
  "refresh_token" text NULL,
  "id_token" text NULL,
  "access_token_expires_at" timestamp NULL,
  "refresh_token_expires_at" timestamp NULL,
  "scope" text NULL,
  "password" text NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create index "account_userId_idx" to table: "account"
CREATE INDEX "account_userId_idx" ON "account" ("user_id");
-- Create "session" table
CREATE TABLE "session" (
  "id" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "token" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL,
  "ip_address" text NULL,
  "user_agent" text NULL,
  "user_id" text NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "session_token_unique" UNIQUE ("token"),
  CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create index "session_userId_idx" to table: "session"
CREATE INDEX "session_userId_idx" ON "session" ("user_id");
