import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../utils/errors';
import { JwtPayload } from '../models/types';

declare global {
   namespace Express {
      interface Request {
         user?: JwtPayload;
      }
   }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
   try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
         throw new UnauthorizedError('No token provided');
      }

      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      req.user = decoded;
      next();
   } catch (error) {
      if (error instanceof UnauthorizedError) {
         next(error);
         return;
      }
      next(new UnauthorizedError('Invalid or expired token'));
   }
}
