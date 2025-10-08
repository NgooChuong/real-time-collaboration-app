import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import {
  createMessageOrImageRequiredError,
  createConversationIdRequiredError,
  createUserNotParticipantError,
  createErrorResponse,
  createSuccessResponse,
  throwIf,
  isAppError,
  createInternalServerError,
  createMessageNotFoundError,
  createCannotDeleteOthersMessagesError,
  createCannotEditOthersMessagesError,
  createMessageRequiredError,
  throwIfNull,
} from '../../exceptions';

export const newMessage = async (req: Request, res: Response) => {
  try {
    const { message, conversationId, img, replyToId } = req.body;

    // Validation
    throwIf(
      (!message || message.trim() === '') && (!img || img === ''),
      createMessageOrImageRequiredError(),
    );
    throwIf(!conversationId, createConversationIdRequiredError());

    const authorId = req.userId;
    const parsedAuthorId = parseInt(authorId);
    const parsedConversationId = parseInt(conversationId);

    await prisma.$transaction(async (tx) => {
      const conversationUser = await tx.conversationUser.findFirst({
        where: { userId: parsedAuthorId, conversationId: parsedConversationId },
        select: { id: true },
      });

      throwIf(!conversationUser, createUserNotParticipantError());

      const created = await tx.message.create({
        data: {
          message: message ?? null,
          authorId: parsedAuthorId,
          conversationId: parsedConversationId,
          conversationUserId: conversationUser?.id,
          img: img || null,
          replyToId: replyToId ? parseInt(replyToId) : null,
        },
        select: {
          id: true,
          message: true,
          img: true,
          authorId: true,
          created_at: true,
          isEdited: true,
          conversationId: true,
          conversationUserId: true,
          replyToId: true,
        },
      });

      await tx.conversation.update({
        where: { id: parsedConversationId },
        data: { dateLastMessage: new Date() },
      });

      await tx.conversationUser.updateMany({
        where: {
          conversationId: parsedConversationId,
          NOT: { userId: parsedAuthorId },
        },
        data: { isRead: false },
      });

      let repliedToMessage: {
        id: number;
        message: string;
        img: string | null;
        authorId: number;
        authorDisplayName: string;
      } | null = null;
      if (created.replyToId) {
        const replied = await tx.message.findUnique({
          where: { id: created.replyToId },
          select: {
            id: true,
            message: true,
            img: true,
            authorId: true,
            author: { select: { display_name: true } },
          },
        });
        if (replied) {
          repliedToMessage = {
            id: replied.id,
            message: replied.message ?? '',
            img: replied.img ?? '',
            authorId: replied.authorId,
            authorDisplayName: replied.author?.display_name ?? '',
          };
        }
      }

      const response = {
        id: created.id,
        message: created.message ?? '',
        img: created.img ?? '',
        authorId: created.authorId,
        created_at: created.created_at,
        replyToId: created.replyToId ?? null,
        repliedToMessage: repliedToMessage,
      };

      res
        .status(200)
        .json(createSuccessResponse(response, 'Message sent successfully'));
    });
  } catch (err: unknown) {
    if (isAppError(err)) {
      return res.status(err.statusCode).json(createErrorResponse(err));
    }
    console.error(err);
    const error = createInternalServerError();
    res.status(error.statusCode).json(createErrorResponse(error));
  }
};

export const getMessagesInConversation = async (
  req: Request,
  res: Response,
) => {
  try {
    const { conversationId, page = 1, limit = 10 } = req.query;

    throwIf(!conversationId, createConversationIdRequiredError());

    const currentUserId = req.userId;
    const parsedCurrentUserId = parseInt(currentUserId as string);
    const parsedConversationId = parseInt(conversationId as string);
    const parsedPage = parseInt(page as string);
    const parsedLimit = parseInt(limit as string);

    const conversationUserIds = await prisma.conversationUser.findMany({
      where: { conversationId: parsedConversationId },
      select: { userId: true },
    });

    throwIf(
      !conversationUserIds.some((user) => user.userId === parsedCurrentUserId),
      createUserNotParticipantError(),
    );

    await prisma.conversationUser.updateMany({
      where: {
        conversationId: parsedConversationId,
        userId: parsedCurrentUserId,
      },
      data: { isRead: true },
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: parsedConversationId },
      orderBy: { created_at: 'desc' },
      skip: (parsedPage - 1) * parsedLimit,
      take: parsedLimit,
      select: {
        id: true,
        message: true,
        img: true,
        authorId: true,
        created_at: true,
        isEdited: true,
        conversationId: true,
        conversationUserId: true,
        replyToId: true,
        replyTo: {
          select: {
            id: true,
            message: true,
            img: true,
            authorId: true,
            author: { select: { display_name: true } },
          },
        },
        reactions: { select: { emoji: true } },
      },
    });

    const shaped = messages.map((m) => {
      const reply = m.replyTo
        ? {
            id: m.replyTo.id,
            message: m.replyTo.message ?? '',
            img: m.replyTo.img ?? '',
            authorId: m.replyTo.authorId,
            authorDisplayName: m.replyTo.author?.display_name ?? '',
          }
        : null;

      const counts = m.reactions.reduce<Record<string, number>>((acc, r) => {
        const key = r.emoji ?? '';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const reactions = Object.entries(counts).map(([emoji, count]) => ({
        emoji,
        count,
      }));

      return {
        id: m.id,
        message: m.message ?? '',
        img: m.img ?? '',
        authorId: m.authorId,
        created_at: m.created_at,
        isEdited: m.isEdited,
        conversationId: m.conversationId,
        conversationUserId: m.conversationUserId,
        replyToId: m.replyToId,
        repliedToMessage: reply,
        reactions,
      };
    });

    res
      .status(200)
      .json(createSuccessResponse(shaped, 'Messages retrieved successfully'));
  } catch (err: unknown) {
    if (isAppError(err)) {
      return res.status(err.statusCode).json(createErrorResponse(err));
    }
    console.error(err);
    const error = createInternalServerError();
    res.status(error.statusCode).json(createErrorResponse(error));
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const message = await prisma.message.findUnique({
      where: { id },
      select: { authorId: true },
    });

    throwIfNull(message, createMessageNotFoundError());
    throwIf(
      message?.authorId !== parseInt(req.userId),
      createCannotDeleteOthersMessagesError(),
    );

    await prisma.message.delete({ where: { id } });

    res
      .status(200)
      .json(
        createSuccessResponse(
          { messageId: id },
          'Message deleted successfully',
        ),
      );
  } catch (err: unknown) {
    if (isAppError(err)) {
      return res.status(err.statusCode).json(createErrorResponse(err));
    }
    console.error(err);
    const error = createInternalServerError();
    res.status(error.statusCode).json(createErrorResponse(error));
  }
};

export const editMessage = async (req: Request, res: Response) => {
  try {
    const { message: newMessageBody } = req.body;

    throwIf(
      !newMessageBody || newMessageBody.trim() === '',
      createMessageRequiredError(),
    );

    const id = parseInt(req.params.id);
    const message = await prisma.message.findUnique({
      where: { id },
      select: { authorId: true },
    });

    throwIfNull(message, createMessageNotFoundError());
    throwIf(
      message?.authorId !== parseInt(req.userId),
      createCannotEditOthersMessagesError(),
    );

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { message: newMessageBody, isEdited: true },
      select: {
        id: true,
        message: true,
        img: true,
        authorId: true,
        created_at: true,
        isEdited: true,
        conversationId: true,
      },
    });

    res
      .status(200)
      .json(
        createSuccessResponse(updatedMessage, 'Message edited successfully'),
      );
  } catch (err: unknown) {
    if (isAppError(err)) {
      return res.status(err.statusCode).json(createErrorResponse(err));
    }
    console.error(err);
    const error = createInternalServerError();
    res.status(error.statusCode).json(createErrorResponse(error));
  }
};

type ReactionsResponse = {
  id: number;
  messageId: number;
  emoji: string;
  count: number;
}[];

export const reactToMessage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { emoji, userId } = req.body;

  try {
    const messageId = parseInt(id);
    await prisma.reaction
      .create({ data: { messageId, emoji, userId: parseInt(userId) } })
      .catch(() => {});

    const grouped = await prisma.reaction.groupBy({
      by: ['messageId', 'emoji'],
      where: { messageId },
      _count: { _all: true },
    });

    const reactions: ReactionsResponse = grouped.map((g) => ({
      id: 0,
      messageId: g.messageId,
      emoji: g.emoji ?? '',
      count: g._count._all,
    }));

    res.status(200).json(reactions);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};
