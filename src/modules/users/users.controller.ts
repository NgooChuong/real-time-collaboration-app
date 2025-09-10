import { Request, Response } from 'express';
import { prisma } from 'config';
import { UserDetails } from 'types';

export const getAllUsers = async (req: Request, res: Response) => {
  const search = (req.query.search as string) || '';
  const { page = 1, limit = 10 } = req.query;
  const parsedPage = parseInt(page as string);
  const parsedLimit = parseInt(limit as string);

  try {
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
    res.status(200).json({
      users: users as unknown as UserDetails[],
      numFound: users.length,
    });
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

export const editUser = async (req: Request, res: Response) => {
  const userIdParsed = parseInt(req.userId);
  const displayNameTrimmed = req.body.display_name?.trim();
  const usernameTrimmed = req.body.username?.trim();
  const profile_picture = req.body.profile_picture;

  try {
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
    res.json(response);
  } catch (err: unknown) {
    console.error(err);
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002')
      return res.status(403).json({ message: 'Username already in use' });
    res.status(500).json({ message: 'Internal server error' });
  }
};
