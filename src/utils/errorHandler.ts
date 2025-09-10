import { Request, Response } from 'express';

export const errorHandler = (err: Error, _req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
};

export default errorHandler;
