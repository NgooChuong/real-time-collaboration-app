import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { dbUser } from '../../types';

const findConversationByParticipants = async (
  currUserId: string,
  participantIds: number[],
) => {
  const arraysEqual = (a: number[], b: number[]) => {
    if (a.length !== b.length) return false;
    a = a.slice().sort();
    b = b.slice().sort();
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  try {
    const allUserNonGroupConversations = await prisma.conversation.findMany({
      where: {
        isGroup: false,
        users: { some: { userId: parseInt(currUserId) } },
      },
      select: {
        id: true,
        title: true,
        created_at: true,
        dateLastMessage: true,
        isGroup: true,
        ownerId: true,
        group_picture: true,
        users: {
          select: {
            id: true,
            userId: true,
            user: { select: { display_name: true, profile_picture: true } },
          },
        },
      },
    });

    let conversationTargetId = -1;
    const participants = allUserNonGroupConversations.map((c) =>
      c.users.map((p) => p.userId),
    );
    for (let i = 0; i < participants.length; i++) {
      if (arraysEqual(participantIds, participants[i])) {
        conversationTargetId = i;
      }
    }

    if (conversationTargetId !== -1) {
      const conversation = allUserNonGroupConversations[conversationTargetId];
      const response = {
        id: conversation.id,
        title: conversation.title,
        participants: conversation.users.map((p) => ({
          id: p.userId,
          display_name: p.user.display_name ?? '',
          profile_picture: p.user.profile_picture ?? '',
        })),
      };
      return response;
    }

    return null;
  } catch (err) {
    console.error(err);
  }
};

export const newConversation = async (req: Request, res: Response) => {
  const participantIdsRaw: number[] = req.body.participants;
  const isGroup: boolean = Boolean(req.body.isGroup);
  const title: string | null = req.body.title ?? null;
  const group_picture: string = req.body.group_picture ?? '';

  if (!participantIdsRaw || participantIdsRaw.length === 0)
    res.status(400).json({ message: 'Must provide array of participants' });

  try {
    if (!isGroup) {
      const existingConversation = await findConversationByParticipants(
        req.userId,
        participantIdsRaw,
      );
      if (existingConversation !== null) {
        return res.status(200).json(existingConversation);
      }
    }

    const ownerId = isGroup ? parseInt(req.userId) : null;
    const created = await prisma.conversation.create({
      data: { title, isGroup, ownerId, group_picture },
      select: { id: true, title: true },
    });

    const conversationId = created.id;
    // Ensure current user (owner for group) is included and unique
    const participantIdsUnique = Array.from(
      new Set<number>([
        ...participantIdsRaw.map((p) => parseInt(String(p))),
        parseInt(req.userId),
      ]),
    );

    await prisma.conversationUser.createMany({
      data: participantIdsUnique.map((participantId) => ({
        userId: participantId,
        conversationId,
        isRead: true,
        role: isGroup && participantId === ownerId ? 'owner' : 'member',
      })),
      skipDuplicates: true,
    });

    const createdConversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        id: true,
        title: true,
        isGroup: true,
        ownerId: true,
        group_picture: true,
        users: {
          select: {
            userId: true,
            user: { select: { display_name: true, profile_picture: true } },
          },
        },
      },
    });

    const response = {
      id: createdConversation!.id,
      title: createdConversation!.title,
      isGroup: createdConversation!.isGroup,
      ownerId: createdConversation!.ownerId,
      group_picture: createdConversation!.group_picture ?? '',
      participants: createdConversation!.users.map((p) => ({
        id: p.userId,
        display_name: p.user.display_name ?? '',
        profile_picture: p.user.profile_picture ?? '',
      })),
    };
    res.status(201).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err });
  }
};

export const getAllConversations = async (req: Request, res: Response) => {
  // Participant shape is inferred from query selections

  const { userId } = req.params;
  const userIdParsed = parseInt(userId);

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        users: { some: { userId: userIdParsed } },
        OR: [{ isGroup: true }, { messages: { some: {} } }],
      },
      orderBy: { dateLastMessage: 'desc' },
      select: {
        id: true,
        title: true,
        isGroup: true,
        ownerId: true,
        group_picture: true,
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1,
          select: { id: true, message: true, img: true, created_at: true },
        },
        users: {
          select: {
            isRead: true,
            user: {
              select: {
                id: true,
                username: true,
                display_name: true,
                profile_picture: true,
              },
            },
          },
        },
      },
    });

    const response = conversations.map((c) => {
      const lastMessage = c.messages[0]
        ? {
            id: c.messages[0].id,
            message: c.messages[0].message ?? '',
            img: c.messages[0].img ?? '',
            created_at: c.messages[0].created_at,
          }
        : undefined;

      const participants = c.users.map((p) => p.user as unknown as dbUser);
      const isRead = c.users.find((p) => p.user.id === userIdParsed)?.isRead;

      return {
        id: c.id,
        title: c.title,
        isGroup: c.isGroup,
        ownerId: c.ownerId,
        group_picture: c.group_picture ?? '',
        lastMessageSent: lastMessage,
        participants,
        isRead,
      };
    });

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err });
  }
};

export const readConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const parsedConversationId = parseInt(conversationId);
  const userId = req.userId;
  const parsedUserId = parseInt(userId);
  try {
    await prisma.conversationUser.updateMany({
      where: { conversationId: parsedConversationId, userId: parsedUserId },
      data: { isRead: true },
    });
    res
      .status(200)
      .json({ message: 'Conversation has been read successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err });
  }
};

export const updateConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const parsedConversationId = parseInt(conversationId);
  const { title, img } = req.body;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: parsedConversationId },
      select: { id: true, isGroup: true, ownerId: true },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (!conversation.isGroup) {
      return res
        .status(400)
        .json({ message: 'Only group conversations can be updated' });
    }

    if (conversation.ownerId !== parseInt(req.userId)) {
      return res
        .status(403)
        .json({ message: 'Only the owner can update this conversation' });
    }

    const titleTrimmed = title?.trim();

    const updated = await prisma.conversation.update({
      where: { id: parsedConversationId },
      data: {
        title: titleTrimmed && titleTrimmed !== '' ? titleTrimmed : undefined,
        group_picture: img && img !== '' ? img : undefined,
      },
      select: { id: true, title: true, group_picture: true },
    });

    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err });
  }
};

export const deleteConversation = async (req: Request, res: Response) => {
  const { conversationId } = req.params;
  const parsedConversationId = parseInt(conversationId);
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: parsedConversationId },
      select: { id: true, isGroup: true, ownerId: true },
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Leave group conversation
    if (conversation.isGroup && conversation.ownerId !== parseInt(req.userId)) {
      await prisma.conversationUser.deleteMany({
        where: {
          conversationId: parsedConversationId,
          userId: parseInt(req.userId),
        },
      });
      return res
        .status(200)
        .json({ message: 'You have left the group conversation' });
    }

    await prisma.conversation.delete({ where: { id: parsedConversationId } });
    res.status(200).json({ message: 'Conversation deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err });
  }
};
