-- Create "form_template" table
CREATE TABLE "form_template" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "description" text NULL,
  "organization_id" text NOT NULL,
  "created_by" text NOT NULL,
  "archived_at" timestamp NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "form_template_created_by_member_id_fk" FOREIGN KEY ("created_by") REFERENCES "member" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT "form_template_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "form_template_created_by_idx" to table: "form_template"
CREATE INDEX "form_template_created_by_idx" ON "form_template" ("created_by");
-- Create index "form_template_organization_idx" to table: "form_template"
CREATE INDEX "form_template_organization_idx" ON "form_template" ("organization_id");
-- Create index "form_template_archived_at_idx" to table: "form_template"
CREATE INDEX "form_template_archived_at_idx" ON "form_template" ("archived_at");
-- Create index "form_template_org_archived_idx" to table: "form_template"
CREATE INDEX "form_template_org_archived_idx" ON "form_template" ("organization_id", "archived_at");
