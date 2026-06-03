import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resetPasswordRequest,
  resetPassword,
  getMe,
  updateProfile,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  resetPasswordSchema,
  updatePasswordSchema
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/verify-email/:token', verifyEmail);
router.post('/reset-password', validate(resetPasswordSchema), resetPasswordRequest);
router.put('/reset-password/:token', validate(updatePasswordSchema), resetPassword);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/me', validate(updateProfileSchema), updateProfile);

export default router;
