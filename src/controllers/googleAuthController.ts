// src/controllers/googleAuthController.ts

import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { verifyGoogleCode, getAuthUrl } from '../services/googleAuthService';
import { AuthenticatedRequest } from '../interfaces/userReq';

/**
 * ==============================================================================================
 * Starter Google OAuth2‑flow.
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
 * Bytter kode til tokens, upserter bruger i Mongo, udsteder JWT inkl. tokens.
 * ==============================================================================================
 */
export const googleCallback: RequestHandler = async (req, res, next) => {
  const code = req.query.code as string;

  if (!code) {
    res.status(400).json({ error: 'Manglende kode fra Google' });
    return;
  }

  try {
    const { user, tokens } = await verifyGoogleCode(code);

    const jwtToken = jwt.sign(
      {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        picture: user.picture,
        refreshToken: tokens.refresh_token
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    console.log('✅ JWT oprettet:', jwtToken);

    res.json({
      token: jwtToken,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture
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
 * Forudsætter, at requireAuth har placeret JwtUserPayload i req.user.
 * ==============================================================================================
 */
export const getMe: RequestHandler = (req: AuthenticatedRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Ikke logget ind' })
    return
  }

  const { email, name, picture, exp } = req.user

  res.json({
    user: {
      email,
      name,
      picture,
      exp
    }
  })
}

/**
 * ==============================================================================================
 * Beskyttet endpoint: Logger brugeren ud ved at slette JWT fra browserens cookies.
 * ==============================================================================================
 */
export const logout: RequestHandler = (req, res) => {
  // Fjern evt. cookie
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })

  res.status(200).json({ message: 'Logout successful' })
}


