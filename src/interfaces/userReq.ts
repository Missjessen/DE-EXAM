// src/interfaces/userReq.ts
import { Request } from 'express';

export interface JwtUserPayload {
  _id: string;
  email: string;
  name: string;
  picture: string;
  googleId?: string;
  refreshToken?: string;
  accessToken?: string;
  iat: number;
  exp: number;
  tenantId?: string;      
}

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
  tenantId?: string;      
}
