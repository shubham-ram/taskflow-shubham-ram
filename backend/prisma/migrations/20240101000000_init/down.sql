-- DropForeignKeys
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_assignee_id_fkey";
ALTER TABLE "tasks" DROP CONSTRAINT IF EXISTS "tasks_project_id_fkey";
ALTER TABLE "projects" DROP CONSTRAINT IF EXISTS "projects_owner_id_fkey";

-- DropTables
DROP TABLE IF EXISTS "tasks";
DROP TABLE IF EXISTS "projects";
DROP TABLE IF EXISTS "users";

-- DropEnums
DROP TYPE IF EXISTS "TaskPriority";
DROP TYPE IF EXISTS "TaskStatus";
