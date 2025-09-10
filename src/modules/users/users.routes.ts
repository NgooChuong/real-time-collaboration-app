import express, { Router } from 'express';
import { editUser, getAllUsers } from './users.controller';
import { verifyJWT } from '../../middleware/verifyJWT';

const usersRouter: Router = express.Router();

usersRouter.get('/', verifyJWT, getAllUsers);

usersRouter.put('/:userId', verifyJWT, editUser);

export default usersRouter;
