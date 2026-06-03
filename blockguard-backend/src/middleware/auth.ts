import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_blockguard';

interface JwtPayload {
  id: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'Not authorized, no token' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User belonging to this token no longer exists' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Not authorized, token failed' });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): any => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'You do not have permission to perform this action' });
    }
    next();
  };
};
