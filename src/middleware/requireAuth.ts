// src/middleware/requireAuth.ts
import { RequestHandler, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, JwtUserPayload } from '../interfaces/userReq';

/**
 * ==============================================================================================
 * Middleware til at beskytte ruter, der kræver autentificering.
 * Kontrollerer, om JWT-token er gyldigt og tilføjer brugeroplysninger til anmodningen.
 * ==============================================================================================
 */
export const requireAuth: RequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ error: 'Ingen adgang. Mangler token.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtUserPayload;

    req.user = {
      _id: decoded._id,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      refreshToken: decoded.refreshToken,
      iat: decoded.iat,
      exp: decoded.exp
    }

    next();
  } catch (err) {
    res.status(401).json({ error: 'Ugyldigt eller udløbet token.' });
  }
}


