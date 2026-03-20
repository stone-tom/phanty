-- Modify "session" table
ALTER TABLE "session" ADD COLUMN "active_organization_id" text NULL;
-- Create "organization" table
CREATE TABLE "organization" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "logo" text NULL,
  "created_at" timestamp NOT NULL,
  "metadata" text NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "organization_slug_unique" UNIQUE ("slug")
);
-- Create index "organization_slug_uidx" to table: "organization"
CREATE UNIQUE INDEX "organization_slug_uidx" ON "organization" ("slug");
-- Create "invitation" table
CREATE TABLE "invitation" (
  "id" text NOT NULL,
  "organization_id" text NOT NULL,
  "email" text NOT NULL,
  "role" text NULL,
  "status" text NOT NULL DEFAULT 'pending',
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp NOT NULL,
  "inviter_id" text NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "user" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create index "invitation_email_idx" to table: "invitation"
CREATE INDEX "invitation_email_idx" ON "invitation" ("email");
-- Create index "invitation_organizationId_idx" to table: "invitation"
CREATE INDEX "invitation_organizationId_idx" ON "invitation" ("organization_id");
-- Create "member" table
CREATE TABLE "member" (
  "id" text NOT NULL,
  "organization_id" text NOT NULL,
  "user_id" text NOT NULL,
  "role" text NOT NULL DEFAULT 'member',
  "created_at" timestamp NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create index "member_organizationId_idx" to table: "member"
CREATE INDEX "member_organizationId_idx" ON "member" ("organization_id");
-- Create index "member_userId_idx" to table: "member"
CREATE INDEX "member_userId_idx" ON "member" ("user_id");
