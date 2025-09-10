import { Router, Request, Response } from 'express';
import { UserCreationResponse } from '../types';
import sql from '../config/db';

const router = Router();

// Get all users
router.get('/', async (req: Request, res: Response) => {
  try {
    // Example: Get all users from database
    const users = await sql`
      SELECT id, display_name, username, profile_picture, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await sql`
      SELECT id, display_name, username, profile_picture, created_at 
      FROM users 
      WHERE id = ${id}
    `;

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user
router.post('/', (req: Request, res: Response) => {
  // TODO: Implement user creation logic
  const userResponse: UserCreationResponse = {
    id: 1,
    display_name: 'New User',
    username: 'newuser',
  };
  res.json(userResponse);
});

// Update user
router.put('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  // TODO: Implement user update logic
  res.json({ message: `Updated user ${id}` });
});

// Delete user
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  // TODO: Implement user deletion logic
  res.json({ message: `Deleted user ${id}` });
});

export default router;
