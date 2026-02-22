import { Router } from 'express';
import { classify } from './classify.controller';

const router = Router();

router.post('/classify', classify);

export default router;
