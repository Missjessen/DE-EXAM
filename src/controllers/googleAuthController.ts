// src/controllers/googleAuthController.ts

import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { verifyGoogleCode, getAuthUrl } from '../services/googleAuthService';
import { AuthenticatedRequest } from '../interfaces/userReq';

/**
 * ==============================================================================================
 * Starter Google OAuth2-flow.
 * Redirecter til Googles samtykkeskærm med alle SCOPES (Ads, Sheets, userinfo).
 * ==============================================================================================
 */
export const googleLogin: RequestHandler = (_req, res) => {
  const url = getAuthUrl();
  return res.redirect(url);
};

/**
 * ==============================================================================================
 * Callback fra Google efter login.
 * Bytter kode til tokens, upserter bruger i Mongo, udsteder JWT inkl. tenantId.
 * ==============================================================================================
 */
export const googleCallback: RequestHandler = async (req, res, next) => {
  const code = req.query.code as string;
  if (!code) {
    res.status(400).json({ error: 'Manglende kode fra Google' });
    return;
  }

  try {
    // 1) Læs tenantId (hvis du sender det fx i en header), ellers brug 'default'
    const tenantId = (req.header('X-Tenant-ID') as string) || 'default';

    // 2) Kald servicelaget med tenantId
    const { user, tokens } = await verifyGoogleCode(code, tenantId);

    // 3) Signér JWT inkl. tenantId
    const jwtToken = jwt.sign(
      {
        _id:          user._id,
        email:        user.email,
        name:         user.name,
        picture:      user.picture,
        refreshToken: user.refreshToken,
        tenantId:     user.tenantId
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    console.log('✅ JWT oprettet:', jwtToken);

    // 4) Returnér token + user (inkl. tenantId)
    res.json({
      token: jwtToken,
      user: {
        _id:       user._id,
        email:     user.email,
        name:      user.name,
        picture:   user.picture,
        tenantId:  user.tenantId
      }
    });
  } catch (err) {
    console.error('❌ Google callback fejl:', err);
    next(err);
  }
};

/**
 * ==============================================================================================
 * Beskyttet endpoint: Henter oplysninger om den loggede bruger.
 * Forudsætter, at authMiddleware har sat JwtUserPayload i req.user.
 * ==============================================================================================
 */
export const getMe: RequestHandler = (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Ikke logget ind' });
    return;
  }

  // Udtræk også tenantId fra JWT-payload
  const { email, name, picture, exp, tenantId } = req.user;

  res.json({
    user: {
      email,
      name,
      picture,
      exp,
      tenantId
    }
  });
};

/**
 * ==============================================================================================
 * Beskyttet endpoint: Logger brugeren ud ved at slette JWT fra cookies.
 * ==============================================================================================
 */
export const logout: RequestHandler = (_req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  res.status(200).json({ message: 'Logout successful' });
};

