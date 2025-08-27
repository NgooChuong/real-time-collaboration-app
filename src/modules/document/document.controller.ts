import { Request, Response } from 'express';
import { documentService } from './document.service';

export const getDocument = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const doc = await documentService.getById(id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  return res.json(doc);
};

export const createDocument = async (req: Request, res: Response) => {
  const { title, content } = req.body as { title: string; content: string };
  const doc = await documentService.create({ title, content });
  return res.status(201).json(doc);
};


