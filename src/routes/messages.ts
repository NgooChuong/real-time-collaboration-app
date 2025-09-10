import { Router, Request, Response } from 'express';
import { NewMessageResponse } from '../types';

const router = Router();

// Get messages for a conversation
router.get('/conversation/:conversationId', (req: Request, res: Response) => {
  const { conversationId } = req.params;
  // TODO: Implement get messages by conversation logic
  res.json({ message: `Messages for conversation ${conversationId}` });
});

// Create new message
router.post('/', (req: Request, res: Response) => {
  // TODO: Implement message creation logic
  const newMessage: NewMessageResponse = {
    id: 1,
    message: 'New message',
    img: '',
    authorId: 1,
    created_at: new Date(),
  };
  res.json(newMessage);
});

// Get message by ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  // TODO: Implement get message by ID logic
  res.json({ message: `Message ${id}` });
});

// Update message
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  // TODO: Implement message update logic
  res.json({ message: `Updated message ${id}` });
});

// Delete message
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  // TODO: Implement message deletion logic
  res.json({ message: `Deleted message ${id}` });
});

export default router;
