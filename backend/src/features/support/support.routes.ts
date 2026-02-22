import { Router } from 'express';
import { getFAQs, submitContact } from './support.controller';

const router = Router();

router.get('/faqs',    getFAQs);
router.post('/contact', submitContact);

export default router;
