import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createTaskSchema, updateTaskSchema } from "../schemas/task";
import { AppError } from "../middleware/errorHandler";

const router = Router();

router.use(authenticate);

// GET /projects/:projectId/tasks — list tasks with filters + pagination
router.get(
  "/projects/:projectId/tasks",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.projectId as string;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(
        50,
        Math.max(1, parseInt(req.query.limit as string) || 10),
      );
      const skip = (page - 1) * limit;

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new AppError(404, "not found");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: any = { projectId };
      if (req.query.status) {
        where.status = req.query.status as string;
      }
      if (req.query.assignee) {
        where.assigneeId = req.query.assignee as string;
      }

      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          include: {
            assignee: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.task.count({ where }),
      ]);

      res.json({
        data: tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// POST /projects/:projectId/tasks — create task in project
router.post(
  "/projects/:projectId/tasks",
  validate(createTaskSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = req.params.projectId as string;

      const project = await prisma.project.findUnique({
        where: { id: projectId },
      });
      if (!project) {
        throw new AppError(404, "not found");
      }

      const { title, description, status, priority, assigneeId, dueDate } =
        req.body;

      const task = await prisma.task.create({
        data: {
          title,
          description,
          status,
          priority,
          projectId,
          assigneeId: assigneeId || null,
          createdBy: req.userId!,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
      });

      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  },
);

// PATCH /tasks/:id — update any task field
router.patch(
  "/:id",
  validate(updateTaskSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const task = await prisma.task.findUnique({ where: { id } });
      if (!task) {
        throw new AppError(404, "not found");
      }

      const { dueDate, ...rest } = req.body;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = { ...rest };
      if (dueDate !== undefined) {
        data.dueDate = dueDate ? new Date(dueDate) : null;
      }

      const updated = await prisma.task.update({
        where: { id },
        data,
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /tasks/:id — delete (project owner or task creator only)
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const task = await prisma.task.findUnique({
        where: { id },
        include: { project: true },
      });

      if (!task) {
        throw new AppError(404, "not found");
      }

      const isCreator = task.createdBy === req.userId;
      const isProjectOwner = task.project.ownerId === req.userId;

      if (!isCreator && !isProjectOwner) {
        throw new AppError(403, "forbidden");
      }

      await prisma.task.delete({ where: { id } });

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

export default router;
