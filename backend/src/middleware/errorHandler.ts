import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string | number;
}

/**
 * Global error handler — must be registered LAST with app.use().
 * Converts any unhandled error into a consistent JSON response.
 */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  console.error('Unhandled error:', err);

  const status = err.statusCode ?? 500;

  // Mongoose duplicate-key error
  if (err.code === 11000) {
    res.status(409).json({ success: false, message: 'Duplicate entry — resource already exists.' });
    return;
  }

  res.status(status).json({
    success: false,
    message: err.message ?? 'Internal server error.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
