import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { env } from '../config/environment';

interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    requestId?: string;
    timestamp: string;
  };
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  // If it's not an AppError, wrap it
  if (!(error instanceof AppError)) {
    error = new AppError(
      env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
      500,
      false
    );
  }

  const appError = error as AppError;

  // Log error details for debugging
  console.error({
    message: appError.message,
    statusCode: appError.statusCode,
    stack: appError.stack,
    requestId: req.id,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Prepare response
  const errorResponse: ErrorResponse = {
    error: {
      message: appError.message,
      code: appError.code,
      requestId: req.id,
      timestamp: new Date().toISOString(),
    },
  };

  // Don't send stack trace in production
  if (env.NODE_ENV === 'development') {
    (errorResponse.error as any).stack = appError.stack;
  }

  res.status(appError.statusCode).json(errorResponse);
};

// Catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
