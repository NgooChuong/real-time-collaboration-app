import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from 'config';
import { env } from 'config/env';
import {
  createRequiredFieldError,
  createUsernameAlreadyInUseError,
  createUserNotFoundError,
  createIncorrectPasswordError,
  createUnauthorizedError,
  createForbiddenError,
  createErrorResponse,
  createSuccessResponse,
  throwIf,
  throwIfNull,
  isAppError,
  createInternalServerError,
} from '../../exceptions';

interface Token {
  userId: string;
}

export const registerNewUser = async (req: Request, res: Response) => {
  try {
    const { display_name, username, password } = req.body;

    // Validation
    throwIf(
      !display_name || display_name === '',
      createRequiredFieldError('Display name'),
    );
    throwIf(!username || username === '', createRequiredFieldError('Username'));
    throwIf(!password || password === '', createRequiredFieldError('Password'));

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await prisma.user.findUnique({ where: { username } });
    throwIf(!!existingUser, createUsernameAlreadyInUseError());

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

    res
      .status(200)
      .json(createSuccessResponse(response, 'Registration successful'));
  } catch (err: unknown) {
    if (isAppError(err)) {
      return res.status(err.statusCode).json(createErrorResponse(err));
    }
    console.error(err);
    const error = createInternalServerError();
    res.status(error.statusCode).json(createErrorResponse(error));
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    // Validation
    throwIf(!username || username === '', createRequiredFieldError('Username'));
    throwIf(!password || password === '', createRequiredFieldError('Password'));

    const user = await prisma.user.findUnique({ where: { username } });
    throwIfNull(user, createUserNotFoundError());

    const isPasswordValid = await bcrypt.compare(
      password,
      user?.password as string,
    );
    throwIf(!isPasswordValid, createIncorrectPasswordError());

    const accessToken = jwt.sign(
      { userId: user?.id },
      env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: '900000',
      },
    );

    const refreshToken = jwt.sign(
      { userId: user?.id },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' },
    );

    await prisma.user.update({
      where: { id: user?.id },
      data: { refresh_token: refreshToken },
    });

    const response = {
      id: user?.id,
      display_name: user?.display_name,
      username: user?.username,
      accessToken,
      profile_picture: user?.profile_picture,
    };

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json(createSuccessResponse(response, 'Login successful'));
  } catch (err: unknown) {
    if (isAppError(err)) {
      return res.status(err.statusCode).json(createErrorResponse(err));
    }
    console.error(err);
    const error = createInternalServerError();
    res.status(error.statusCode).json(createErrorResponse(error));
  }
};

export const handleRefreshToken = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    throwIf(!cookies?.jwt, createUnauthorizedError());

    const refreshToken = cookies.jwt as string;
    const user = await prisma.user.findFirst({
      where: { refresh_token: refreshToken },
    });
    throwIfNull(user, createForbiddenError());

    jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json(createErrorResponse(createForbiddenError()));
      }

      const userId = (decoded as Token).userId;
      if (user?.id.toString() !== userId.toString()) {
        return res
          .status(403)
          .json(createErrorResponse(createForbiddenError()));
      }

      const accessToken = jwt.sign(
        { userId: userId },
        env.ACCESS_TOKEN_SECRET,
        { expiresIn: '900000' }, // 15 mins
      );
      res
        .status(200)
        .json(
          createSuccessResponse(
            { accessToken },
            'Token refreshed successfully',
          ),
        );
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

export const handlePersistentLogin = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    throwIf(!cookies?.jwt, createUnauthorizedError());

    const refreshToken = cookies.jwt as string;
    const user = await prisma.user.findFirst({
      where: { refresh_token: refreshToken },
    });
    throwIfNull(user, createForbiddenError());

    jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(403)
          .json(createErrorResponse(createForbiddenError()));
      }

      const userId = (decoded as Token).userId;
      if (user?.id.toString() !== userId.toString()) {
        return res
          .status(403)
          .json(createErrorResponse(createForbiddenError()));
      }

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

      res.status(200).json(createSuccessResponse(response, 'Login successful'));
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
    });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
  }
};

// Legacy exports for backward compatibility
export const login = loginUser;
export const register = registerNewUser;
