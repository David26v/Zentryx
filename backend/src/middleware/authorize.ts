import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded: any) => {
      if (err) return res.sendStatus(403);
      if (!roles.includes(decoded.role)) return res.status(403).json({ message: 'Access denied' });
      (req as any).user = decoded;
      next();
    });
  };
};
