import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: any;
}

const admin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

const allowRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: `Not authorized. Required roles: ${roles.join(', ')}` });
    }
  };
};

export { admin, allowRoles };
