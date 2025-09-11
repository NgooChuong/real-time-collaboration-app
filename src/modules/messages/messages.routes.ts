import express, { Router } from 'express';
import {
  deleteMessage,
  editMessage,
  getMessagesInConversation,
  newMessage,
  reactToMessage,
} from './messages.controller';
import { verifyJWT } from '../../middleware/verifyJWT';

const messagesRouter: Router = express.Router();

/**
 * @swagger
 * /messages/new:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - conversationId
 *               - content
 *             properties:
 *               conversationId:
 *                 type: number
 *                 description: ID of the conversation
 *               content:
 *                 type: string
 *                 description: Message content
 *               recipientId:
 *                 type: number
 *                 description: ID of the recipient (for direct messages)
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
messagesRouter.post('/new', verifyJWT, newMessage);

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: number
 *         description: Conversation ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       content:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       sender:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
messagesRouter.get('/', verifyJWT, getMessagesInConversation);

/**
 * @swagger
 * /messages/{id}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Message ID
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found
 */
/**
 * @swagger
 * /messages/{id}:
 *   put:
 *     summary: Edit a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Message ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: New message content
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found
 */
messagesRouter
  .route('/:id')
  .delete(verifyJWT, deleteMessage)
  .put(verifyJWT, editMessage);

/**
 * @swagger
 * /messages/{id}/react:
 *   put:
 *     summary: React to a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: Message ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reaction
 *             properties:
 *               reaction:
 *                 type: string
 *                 enum: [like, love, laugh, angry, sad]
 *                 description: Reaction type
 *     responses:
 *       200:
 *         description: Reaction added successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found
 */
messagesRouter.put('/:id/react', verifyJWT, reactToMessage);

export default messagesRouter;
