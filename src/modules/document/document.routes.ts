import { Router } from 'express';
import { createDocument, getDocument } from './document.controller';

const router = Router();

router.get('/:id', getDocument);
router.post('/', createDocument);

export default router;


