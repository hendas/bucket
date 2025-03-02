import { NextFunction, Request, Response } from "express";
import { NotFoundException } from "./exceptions/not-found";
import { UnauthorizedException } from "./exceptions/unauthorized";
import { ForbiddenException } from "./exceptions/forbidden";

export const exceptionMiddleware = (
  exception: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(exception);
  let status = 500;
  let message = "Internal server error";
  if (
    exception instanceof NotFoundException ||
    exception instanceof ForbiddenException ||
    exception instanceof UnauthorizedException
  ) {
    status = exception.status;
  }

  if (exception instanceof Error) {
    message = exception.message;
  }

  res.status(status).send(message);
};
