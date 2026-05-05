-- Drop the old form-specific template table. Existing form-template data is intentionally not preserved.
DROP TABLE IF EXISTS "form_template";

-- Create the generic "template" table.
CREATE TABLE "template" (
  "id" text PRIMARY KEY NOT NULL,
  "type" text NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "document" jsonb NOT NULL,
  "organization_id" text NOT NULL,
  "created_by" text NOT NULL,
  "archived_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp NOT NULL,
  CONSTRAINT "template_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "template_created_by_member_id_fk" FOREIGN KEY ("created_by") REFERENCES "member" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);

-- Create indexes for common organization-scoped template lookups.
CREATE INDEX "template_organization_idx" ON "template" ("organization_id");
CREATE INDEX "template_org_type_idx" ON "template" ("organization_id", "type");
CREATE INDEX "template_org_archived_idx" ON "template" ("organization_id", "archived_at");
CREATE INDEX "template_created_by_idx" ON "template" ("created_by");
