import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { UserDetails } from '../../types';
import {
  createErrorResponse,
  createSuccessResponse,
  isAppError,
  createInternalServerError,
  createUsernameAlreadyInUseError,
} from '../../exceptions';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || '';
    const { page = 1, limit = 10 } = req.query;
    const parsedPage = parseInt(page as string);
    const parsedLimit = parseInt(limit as string);

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { display_name: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        display_name: true,
        username: true,
        profile_picture: true,
      },
      take: parsedLimit,
      skip: (parsedPage - 1) * parsedLimit,
    });
    
    res.status(200).json(createSuccessResponse({
      users: users as unknown as UserDetails[],
      numFound: users.length,
    }, 'Users retrieved successfully'));
  } catch (err: unknown) {
    if (isAppError(err)) {
      return res.status(err.statusCode).json(createErrorResponse(err));
    }
    console.error(err);
    const error = createInternalServerError();
    res.status(error.statusCode).json(createErrorResponse(error));
  }
};

export const editUser = async (req: Request, res: Response) => {
  try {
    const userIdParsed = parseInt(req.userId);
    const displayNameTrimmed = req.body.display_name?.trim();
    const usernameTrimmed = req.body.username?.trim();
    const profile_picture = req.body.profile_picture;

    const user = await prisma.user.update({
      where: { id: userIdParsed },
      data: {
        display_name:
          displayNameTrimmed && displayNameTrimmed !== ''
            ? displayNameTrimmed
            : undefined,
        username:
          usernameTrimmed && usernameTrimmed !== ''
            ? usernameTrimmed
            : undefined,
        profile_picture:
          profile_picture && profile_picture !== ''
            ? profile_picture
            : undefined,
      },
      select: {
        id: true,
        display_name: true,
        username: true,
        profile_picture: true,
      },
    });

    const response = {
      display_name: user.display_name ?? null,
      username: user.username ?? null,
      profile_picture: user.profile_picture ?? null,
    };
    res.json(createSuccessResponse(response, 'User updated successfully'));
  } catch (err: unknown) {
    console.error(err);
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
      const error = createUsernameAlreadyInUseError();
      return res.status(error.statusCode).json(createErrorResponse(error));
    }
    if (isAppError(err)) {
      return res.status(err.statusCode).json(createErrorResponse(err));
    }
    const error = createInternalServerError();
    res.status(error.statusCode).json(createErrorResponse(error));
  }
};
