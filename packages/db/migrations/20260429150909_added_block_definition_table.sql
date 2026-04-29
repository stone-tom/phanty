-- Create "block_definition" table
CREATE TABLE "block_definition" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "category" text NOT NULL,
  "type" text NOT NULL,
  "version" integer NOT NULL,
  "status" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL,
  PRIMARY KEY ("id")
);
-- Create index "block_definition_version_uidx" to table: "block_definition"
CREATE UNIQUE INDEX "block_definition_version_uidx" ON "block_definition" ("category", "type", "version");
-- Seed initial global block definitions
INSERT INTO "block_definition" (
  "id",
  "name",
  "description",
  "category",
  "type",
  "version",
  "status",
  "created_at",
  "updated_at"
) VALUES
  (
    '0196f0a0-0000-7000-8000-000000000001',
    'Container',
    'Groups blocks in a simple layout section.',
    'layout',
    'container',
    1,
    'active',
    now(),
    now()
  ),
  (
    '0196f0a0-0000-7000-8000-000000000002',
    'Text Field',
    'Simple text field for short text input.',
    'form',
    'text',
    1,
    'active',
    now(),
    now()
  );
