-- Create "test" table
CREATE TABLE "test" (
  "id" serial NOT NULL,
  "email" character varying(255) NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  CONSTRAINT "test_email_unique" UNIQUE ("email")
);
