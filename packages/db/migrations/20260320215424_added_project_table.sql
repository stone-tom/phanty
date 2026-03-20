-- Create "project" table
CREATE TABLE "project" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "description" text NULL,
  "organization_id" text NOT NULL,
  "created_by" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "project_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "user" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "project_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "project_created_by_idx" to table: "project"
CREATE INDEX "project_created_by_idx" ON "project" ("created_by");
-- Create index "project_organization_idx" to table: "project"
CREATE INDEX "project_organization_idx" ON "project" ("organization_id");
