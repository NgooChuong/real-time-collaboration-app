import { Request, Response } from 'express';
import { authService } from './auth.service';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.login(email, password);
  return res.json(result);
};

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const result = await authService.register(email, password);
  return res.status(201).json(result);
};


