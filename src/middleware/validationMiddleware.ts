import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        }));
        
        console.warn('🚨 Validation failed:', {
          requestId: req.id,
          url: req.url,
          method: req.method,
          errors: formattedErrors,
        });
        
        const validationError = new ValidationError('Request validation failed');
        (validationError as any).details = formattedErrors;
        throw validationError;
      }
      throw new ValidationError('Validation error occurred');
    }
  };
