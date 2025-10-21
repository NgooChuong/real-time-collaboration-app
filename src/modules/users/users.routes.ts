import express, { Router } from 'express';
import { editUser, getAllUsers } from './users.controller';
import { verifyJWT } from '../../middleware/verifyJWT';

const usersRouter: Router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search term for username or display name
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           display_name:
 *                             type: string
 *                             nullable: true
 *                           username:
 *                             type: string
 *                             nullable: true
 *                           profile_picture:
 *                             type: string
 *                             nullable: true
 *                     numFound:
 *                       type: integer
 *                 error:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: Unauthorized
 */
usersRouter.get('/', verifyJWT, getAllUsers);

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     summary: Update user information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               display_name:
 *                 type: string
 *                 description: Display name of the user
 *               username:
 *                 type: string
 *                 description: Username of the user
 *               profile_picture:
 *                 type: string
 *                 description: Profile picture URL
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     display_name:
 *                       type: string
 *                       nullable: true
 *                     username:
 *                       type: string
 *                       nullable: true
 *                     profile_picture:
 *                       type: string
 *                       nullable: true
 *                 error:
 *                   type: object
 *                   nullable: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       409:
 *         description: Username already in use
 */
usersRouter.put('/:userId', verifyJWT, editUser);

export default usersRouter;
