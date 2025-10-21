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
 * /api/messages/new:
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
 *             properties:
 *               conversationId:
 *                 type: number
 *                 description: ID of the conversation
 *               message:
 *                 type: string
 *                 description: Message content (optional if img provided)
 *               img:
 *                 type: string
 *                 description: Image (optional if message provided)
 *               replyToId:
 *                 type: number
 *                 description: ID of the message being replied to (optional)
 *     responses:
 *       200:
 *         description: Message sent successfully
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
 *                       type: number
 *                     message:
 *                       type: string
 *                     img:
 *                       type: string
 *                     authorId:
 *                       type: number
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     replyToId:
 *                       type: number
 *                       nullable: true
 *                     repliedToMessage:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         id:
 *                           type: number
 *                         message:
 *                           type: string
 *                         img:
 *                           type: string
 *                         authorId:
 *                           type: number
 *                         authorDisplayName:
 *                           type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
messagesRouter.post('/new', verifyJWT, newMessage);

/**
 * @swagger
 * /api/messages:
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
 *           default: 10
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       message:
 *                         type: string
 *                       img:
 *                         type: string
 *                       authorId:
 *                         type: number
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       isEdited:
 *                         type: boolean
 *                       conversationId:
 *                         type: number
 *                       conversationUserId:
 *                         type: number
 *                       replyToId:
 *                         type: number
 *                         nullable: true
 *                       repliedToMessage:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: number
 *                           message:
 *                             type: string
 *                           img:
 *                             type: string
 *                           authorId:
 *                             type: number
 *                           authorDisplayName:
 *                             type: string
 *                       reactions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             emoji:
 *                               type: string
 *                             count:
 *                               type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
messagesRouter.get('/', verifyJWT, getMessagesInConversation);

/**
 * @swagger
 * /api/messages/{id}:
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
 *                     messageId:
 *                       type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found
 */
/**
 * @swagger
 * /api/messages/{id}:
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
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: New message content
 *     responses:
 *       200:
 *         description: Message updated successfully
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
 *                       type: number
 *                     message:
 *                       type: string
 *                     img:
 *                       type: string
 *                     authorId:
 *                       type: number
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     isEdited:
 *                       type: boolean
 *                     conversationId:
 *                       type: number
 *                 message:
 *                   type: string
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
 * /api/messages/{id}/react:
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
 *               - emoji
 *               - userId
 *             properties:
 *               emoji:
 *                 type: string
 *                 description: Emoji reaction
 *               userId:
 *                 type: number
 *                 description: User ID of the reactor
 *     responses:
 *       200:
 *         description: Reaction added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   messageId:
 *                     type: number
 *                   emoji:
 *                     type: string
 *                   count:
 *                     type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found
 */
messagesRouter.put('/:id/react', verifyJWT, reactToMessage);

export default messagesRouter;
