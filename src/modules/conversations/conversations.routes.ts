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
 * /conversations/new:
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
 *               - recipientId
 *             properties:
 *               recipientId:
 *                 type: number
 *                 description: ID of the recipient user
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
conversationsRouter.post('/new', verifyJWT, newConversation);

/**
 * @swagger
 * /conversations/{userId}:
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
 *                   participants:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *       401:
 *         description: Unauthorized
 */
conversationsRouter.get('/:userId', verifyJWT, getAllConversations);

/**
 * @swagger
 * /conversations/{conversationId}/read:
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 */
conversationsRouter.put('/:conversationId/read', verifyJWT, readConversation);

/**
 * @swagger
 * /conversations/{conversationId}:
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
 *               isArchived:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Conversation updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 */
conversationsRouter.patch('/:conversationId', verifyJWT, updateConversation);

/**
 * @swagger
 * /conversations/{conversationId}:
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 */
conversationsRouter.delete('/:conversationId', verifyJWT, deleteConversation);

export default conversationsRouter;
