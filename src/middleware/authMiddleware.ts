import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from 'apollo-server-express';

const authMiddleware = (req: Request, _: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  const secret: string | undefined = process.env.SECRET_KEY;

  if (token && secret) {
    try {
      const user = jwt.verify(token, secret) as any;
      req.user = user;
    } catch (error) {
      throw new AuthenticationError('"Invalid or Expired token');
    }
  }

  next();
};

export default authMiddleware;
