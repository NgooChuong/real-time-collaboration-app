import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from 'config';
import { env } from 'config/env';

interface Token {
  userId: string;
}

export const registerNewUser = async (req: Request, res: Response) => {
  const { display_name, username, password } = req.body;

  if (!display_name || display_name === '')
    return res.status(400).json({ message: 'Display name is required' });
  if (!username || username === '')
    return res.status(400).json({ message: 'Username is required' });
  if (!password || password === '')
    return res.status(400).json({ message: 'Password is required' });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(403).json({ message: 'Username already in use' });
    }

    const user = await prisma.user.create({
      data: {
        display_name,
        username,
        password: hashedPassword,
      },
      select: {
        id: true,
        display_name: true,
        username: true,
      },
    });

    const accessToken = jwt.sign(
      { userId: user.id },
      env.ACCESS_TOKEN_SECRET,
      { expiresIn: '900000' }, // 15 min
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' },
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken },
    });

    const response = {
      id: user.id,
      display_name: user.display_name,
      username: user.username,
      accessToken,
    };

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json(response);
  } catch (err: unknown) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || username === '')
    return res.status(400).json({ message: 'Username is required' });
  if (!password || password === '')
    return res.status(400).json({ message: 'Password is required' });

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ message: 'Incorrect password' });

    const accessToken = jwt.sign({ userId: user.id }, env.ACCESS_TOKEN_SECRET, {
      expiresIn: '900000',
    });

    const refreshToken = jwt.sign(
      { userId: user.id },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' },
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: refreshToken },
    });

    const response = {
      id: user.id,
      display_name: user.display_name,
      username: user.username,
      accessToken,
      profile_picture: user?.profile_picture,
    };

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

export const handleRefreshToken = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

    const refreshToken = cookies.jwt as string;
    const user = await prisma.user.findFirst({
      where: { refresh_token: refreshToken },
    });
    if (!user) return res.status(403).json({ message: 'Forbidden' });

    jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      const userId = (decoded as Token).userId;
      if (err || user.id.toString() !== userId.toString())
        return res.status(403).json({ message: 'Forbidden' });
      const accessToken = jwt.sign(
        { userId: userId },
        env.ACCESS_TOKEN_SECRET,
        { expiresIn: '900000' }, // 15 mins
      );
      res.status(200).json({ accessToken });
    });
  } catch (err) {
    console.error(err);
  }
};

export const handlePersistentLogin = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

    const refreshToken = cookies.jwt as string;
    const user = await prisma.user.findFirst({
      where: { refresh_token: refreshToken },
    });
    if (!user) return res.status(403).json({ message: 'Forbidden' });

    jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      const userId = (decoded as Token).userId;
      if (err || user.id.toString() !== userId.toString())
        return res.status(403).json({ message: 'Forbidden' });
      const accessToken = jwt.sign(
        { userId: userId },
        env.ACCESS_TOKEN_SECRET,
        { expiresIn: '900000' }, // 15 mins
      );

      const response = {
        id: user.id,
        display_name: user.display_name,
        username: user.username,
        accessToken,
        profile_picture: user?.profile_picture,
      };

      res.status(200).json(response);
    });
  } catch (err) {
    console.error(err);
  }
};

export const handleLogout = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

    const refreshToken = cookies.jwt;
    const user = await prisma.user.findFirst({
      where: { refresh_token: refreshToken },
    });
    if (!user) {
      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return res.status(204);
    }

    // Delete refresh token from db
    await prisma.user.update({
      where: { id: user.id },
      data: { refresh_token: '' },
    });

    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
  }
};

// Legacy exports for backward compatibility
export const login = loginUser;
export const register = registerNewUser;
