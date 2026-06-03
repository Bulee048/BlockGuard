import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User';
import { generateToken } from '../utils/auth';
import { geocodeAddress } from '../utils/geocoder';
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string().optional(),
    role: z.enum(['resident', 'moderator', 'admin', 'authority']).optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string()
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).optional(),
    phone: z.string().optional(),
    avatar: z.string().url().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      zipCode: z.string().optional()
    }).optional()
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({ email: z.string().email() })
});

export const updatePasswordSchema = z.object({
  body: z.object({ password: z.string().min(6) })
});

export const register = async (req: Request, res: Response): Promise<any> => {
  try {
    const { fullName, email, password, phone, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(20).toString('hex');
    console.log(`[MOCK EMAIL] Send verification email to ${email} with token: ${verificationToken}`);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      role: role || 'resident',
    });

    const token = generateToken(user.id, user.role);
    
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    return res.status(201).json({
      status: 'success',
      token,
      user: userResponse
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.role);

    const userResponse = user.toObject();
    delete (userResponse as any).password;

    return res.status(200).json({
      status: 'success',
      token,
      user: userResponse
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token } = req.params;
    console.log(`[MOCK] Verifying email with token: ${token}`);
    
    return res.status(200).json({ status: 'success', message: 'Email verified successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const resetPasswordRequest = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (user) {
      const resetToken = crypto.randomBytes(20).toString('hex');
      console.log(`[MOCK EMAIL] Send reset password link to ${email} with token: ${resetToken}`);
    }

    return res.status(200).json({ status: 'success', message: 'If email exists, a reset link was sent' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    console.log(`[MOCK] Resetting password for token: ${token}`);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    return res.status(200).json({ status: 'success', message: 'Password has been reset' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<any> => {
  try {
    return res.status(200).json({
      status: 'success',
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const { fullName, phone, avatar, address } = req.body;
    const userId = req.user?.id;

    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;

    if (address) {
      updateData.address = { ...address };
      
      const addressString = `${address.street || ''} ${address.city || ''} ${address.zipCode || ''}`.trim();
      if (addressString) {
        const coords = await geocodeAddress(addressString);
        if (coords) {
          updateData.address.latitude = coords.latitude;
          updateData.address.longitude = coords.longitude;
        }
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({
      status: 'success',
      user: updatedUser
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};
