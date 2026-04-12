import { PrismaClient, TaskStatus, TaskPriority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({
    where: { email: "test@example.com" },
  });

  if (existing) {
    console.log("Seed data already exists, skipping.");
    return;
  }

  const hashedPassword = await bcrypt.hash("password123", 12);

  const user = await prisma.user.create({
    data: {
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "My First Project",
      description: "A sample project to get started with TaskFlow",
      ownerId: user.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: "Set up development environment",
        description: "Install all required dependencies and tools",
        status: TaskStatus.done,
        priority: TaskPriority.high,
        projectId: project.id,
        assigneeId: user.id,
        createdBy: user.id,
      },
      {
        title: "Design database schema",
        description: "Create the data model for the application",
        status: TaskStatus.in_progress,
        priority: TaskPriority.high,
        projectId: project.id,
        assigneeId: user.id,
        createdBy: user.id,
      },
      {
        title: "Write API documentation",
        description: "Document all REST endpoints",
        status: TaskStatus.todo,
        priority: TaskPriority.medium,
        projectId: project.id,
        createdBy: user.id,
      },
    ],
  });

  console.log("Seed data created successfully.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
