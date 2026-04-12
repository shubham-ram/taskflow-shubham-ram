import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public fields?: Record<string, string>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    const body: Record<string, unknown> = { error: err.message };
    if (err.fields) body.fields = err.fields;
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".");
      fields[key] = issue.message;
    }
    res.status(400).json({ error: "validation failed", fields });
    return;
  }

  logger.error(err, "Unhandled error");
  res.status(500).json({ error: "internal server error" });
}
