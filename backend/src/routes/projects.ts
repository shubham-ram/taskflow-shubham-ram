import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createProjectSchema, updateProjectSchema } from "../schemas/project";
import { AppError } from "../middleware/errorHandler";

const router = Router();

// All project routes require authentication
router.use(authenticate);

// GET /projects — list projects user owns or has tasks in (paginated)
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { ownerId: req.userId! },
        { tasks: { some: { assigneeId: req.userId! } } },
      ],
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.project.count({ where }),
    ]);

    res.json({
      data: projects,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// POST /projects — create project
router.post(
  "/",
  validate(createProjectSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description } = req.body;

      const project = await prisma.project.create({
        data: { name, description, ownerId: req.userId! },
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
      });

      res.status(201).json(project);
    } catch (err) {
      next(err);
    }
  }
);

// GET /projects/:id — project details + tasks
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      throw new AppError(404, "not found");
    }

    res.json(project);
  } catch (err) {
    next(err);
  }
});

// PATCH /projects/:id — update (owner only)
router.patch(
  "/:id",
  validate(updateProjectSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;

      const project = await prisma.project.findUnique({ where: { id } });
      if (!project) {
        throw new AppError(404, "not found");
      }

      if (project.ownerId !== req.userId) {
        throw new AppError(403, "forbidden");
      }

      const updated = await prisma.project.update({
        where: { id },
        data: req.body,
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /projects/:id — delete project + all tasks (owner only)
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new AppError(404, "not found");
    }

    if (project.ownerId !== req.userId) {
      throw new AppError(403, "forbidden");
    }

    await prisma.project.delete({ where: { id } });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
