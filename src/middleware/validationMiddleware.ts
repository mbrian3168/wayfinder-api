import { Request, Response, NextFunction } from 'express';
import { AnyZodObject as AnyZodobject, ZodError } from 'zod';

export const validate =
  (schema: AnyZodobject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(error.issues);
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
