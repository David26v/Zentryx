import express from 'express';
import { login, register, forgotPassword, resetPassword, changePassword,  } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', register); 
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', changePassword);

export default router;
