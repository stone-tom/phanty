-- Modify "project" table
ALTER TABLE "project" DROP CONSTRAINT "project_created_by_user_id_fk", ADD CONSTRAINT "project_created_by_member_id_fk" FOREIGN KEY ("created_by") REFERENCES "member" ("id") ON UPDATE NO ACTION ON DELETE NO ACTION;
