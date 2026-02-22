import { Router } from 'express';
import { changePassword, deleteAccount } from './user.controller';

const router = Router();

router.put('/:userId/password',        changePassword);
router.delete('/:userId/account',      deleteAccount);

export default router;
