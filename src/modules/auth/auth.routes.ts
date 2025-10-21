import express, { Router } from 'express';
import {
  handleLogout,
  handlePersistentLogin,
  handleRefreshToken,
  loginUser,
  registerNewUser,
} from './auth.controller';

const authRouter: Router = express.Router();

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - display_name
 *               - username
 *               - password
 *             properties:
 *               display_name:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     display_name:
 *                       type: string
 *                     username:
 *                       type: string
 *                     accessToken:
 *                       type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       409:
 *         description: User already exists
 */
authRouter.post('/signup', registerNewUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     display_name:
 *                       type: string
 *                     username:
 *                       type: string
 *                     accessToken:
 *                       type: string
 *                     profile_picture:
 *                       type: string
 *                       nullable: true
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Bad request
 */
authRouter.post('/login', loginUser);

/**
 * @swagger
 * /api/auth/refresh:
 *   get:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid refresh token
 */
authRouter.get('/refresh', handleRefreshToken);

/**
 * @swagger
 * /api/auth/login/persist:
 *   get:
 *     summary: Check persistent login
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User is logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     display_name:
 *                       type: string
 *                     username:
 *                       type: string
 *                     accessToken:
 *                       type: string
 *                     profile_picture:
 *                       type: string
 *                       nullable: true
 *                 message:
 *                   type: string
 *       401:
 *         description: User not authenticated
 */
authRouter.get('/login/persist', handlePersistentLogin);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     responses:
 *       204:
 *         description: Logout successful
 */
authRouter.post('/logout', handleLogout);

export default authRouter;
