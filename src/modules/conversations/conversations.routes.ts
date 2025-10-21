import express, { Router } from 'express';
import {
  getAllConversations,
  newConversation,
  readConversation,
  updateConversation,
  deleteConversation,
} from './conversations.controller';
import { verifyJWT } from '../../middleware/verifyJWT';

const conversationsRouter: Router = express.Router();

/**
 * @swagger
 * /api/conversations/new:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - participants
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Array of participant user IDs
 *               isGroup:
 *                 type: boolean
 *                 description: Is group conversation
 *               title:
 *                 type: string
 *                 description: Group title (optional)
 *               group_picture:
 *                 type: string
 *                 description: Group picture URL (optional)
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 title:
 *                   type: string
 *                 isGroup:
 *                   type: boolean
 *                 ownerId:
 *                   type: number
 *                   nullable: true
 *                 group_picture:
 *                   type: string
 *                 participants:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       display_name:
 *                         type: string
 *                       profile_picture:
 *                         type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
conversationsRouter.post('/new', verifyJWT, newConversation);

/**
 * @swagger
 * /api/conversations/{userId}:
 *   get:
 *     summary: Get all conversations for a user
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: number
 *         description: User ID
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   title:
 *                     type: string
 *                   isGroup:
 *                     type: boolean
 *                   ownerId:
 *                     type: number
 *                     nullable: true
 *                   group_picture:
 *                     type: string
 *                   lastMessageSent:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       id:
 *                         type: number
 *                       message:
 *                         type: string
 *                       img:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                   participants:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                         username:
 *                           type: string
 *                         display_name:
 *                           type: string
 *                         profile_picture:
 *                           type: string
 *                   isRead:
 *                     type: boolean
 *       401:
 *         description: Unauthorized
 */
conversationsRouter.get('/:userId', verifyJWT, getAllConversations);

/**
 * @swagger
 * /api/conversations/{conversationId}/read:
 *   put:
 *     summary: Mark conversation as read
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: number
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation marked as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 */
conversationsRouter.put('/:conversationId/read', verifyJWT, readConversation);

/**
 * @swagger
 * /api/conversations/{conversationId}:
 *   patch:
 *     summary: Update conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: number
 *         description: Conversation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               img:
 *                 type: string
 *                 description: Group picture URL (optional)
 *     responses:
 *       200:
 *         description: Conversation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 title:
 *                   type: string
 *                 group_picture:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 */
conversationsRouter.patch('/:conversationId', verifyJWT, updateConversation);

/**
 * @swagger
 * /api/conversations/{conversationId}:
 *   delete:
 *     summary: Delete conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: number
 *         description: Conversation ID
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 */
conversationsRouter.delete('/:conversationId', verifyJWT, deleteConversation);

export default conversationsRouter;
