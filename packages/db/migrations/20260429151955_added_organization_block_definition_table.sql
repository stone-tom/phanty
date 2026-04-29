-- Create "organization_block_definition" table
CREATE TABLE "organization_block_definition" (
  "organization_id" text NOT NULL,
  "block_definition_id" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "organization_block_definition_block_definition_id_block_definit" FOREIGN KEY ("block_definition_id") REFERENCES "block_definition" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT "organization_block_definition_organization_id_organization_id_f" FOREIGN KEY ("organization_id") REFERENCES "organization" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create index "organization_block_definition_uidx" to table: "organization_block_definition"
CREATE UNIQUE INDEX "organization_block_definition_uidx" ON "organization_block_definition" ("organization_id", "block_definition_id");
