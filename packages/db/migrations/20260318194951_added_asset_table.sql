-- Create "asset" table
CREATE TABLE "asset" (
  "id" text NOT NULL,
  "filename" text NOT NULL,
  "original_filename" text NULL,
  "directory" text NOT NULL DEFAULT '',
  "storage_key" text NOT NULL,
  "content_type" text NOT NULL,
  "extension" text NULL,
  "size_bytes" bigint NOT NULL,
  "checksum" text NULL,
  "metadata" jsonb NOT NULL DEFAULT '{}',
  "created_by" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "asset_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "user" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "assets_created_by_idx" to table: "asset"
CREATE INDEX "assets_created_by_idx" ON "asset" ("created_by");
