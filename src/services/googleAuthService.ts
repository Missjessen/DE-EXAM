// services/googleAuthService.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { iUserModel } from '../models/iUserModel';
import { IUser } from '../interfaces/iUser';
import * as dotenv from 'dotenv';

dotenv.config();

// Scopes for Sheets, Google Ads and user info
const SCOPES = [
  'https://www.googleapis.com/auth/adwords',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',  
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

/**
 * Opretter og konfigurerer OAuth2-klient
 */
export function createOAuthClient(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  );
}

/**
 * Genererer URL til Google OAuth2 login
 * @returns URL til Google samtykkeskærm
 */
export function getAuthUrl(): string {
  const client = createOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    include_granted_scopes: false,       // tvinger fuld scope‐prompt
    prompt: 'consent select_account',    // viser altid consent + konto‐vælger
    scope: SCOPES
  });
}


/**
 * Verificerer Google login kode og opretter/uppdaterer bruger i MongoDB
 * @param code - Koden fra Google OAuth2 callback
 * @returns Brugerobjekt og tokens fra Google
 */
export async function verifyGoogleCode(
  code: string,
  tenantId: string = 'default'
): Promise<{
  user: {
    _id: string;
    email: string;
    name: string;
    picture: string;
    refreshToken: string;
    tenantId: string;
  };
  tokens: {
    access_token?: string;
    refresh_token?: string;
    expiry_date?: number;
  };
}> {
  // 1) Byt code til tokens
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  // 2) Hent profildata
  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const { data } = await oauth2.userinfo.get();
  const googleId = data.id!;
  const email    = data.email!;
  const name     = data.name!;
  const picture  = data.picture!;

  // 3) Upsert i Mongo med tenantId
  let doc = await iUserModel.findOne({ googleId, tenantId });
  if (!doc) {
    doc = new iUserModel({
      googleId,
      email,
      name,
      picture,
      refreshToken: tokens.refresh_token!,
      accessToken:  tokens.access_token!,
      expiryDate:   tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      tenantId
    });
  } else {
    doc.accessToken  = tokens.access_token ?? doc.accessToken;
    if (tokens.refresh_token) doc.refreshToken = tokens.refresh_token;
    if (tokens.expiry_date)   doc.expiryDate   = new Date(tokens.expiry_date);
    doc.tenantId = tenantId;
  }
  await doc.save();

  // 4) Saniter tokens fra Google – null → undefined
  const safeTokens: {
    access_token?: string;
    refresh_token?: string;
    expiry_date?: number;
  } = {};
  if (tokens.access_token)  safeTokens.access_token  = tokens.access_token;
  if (tokens.refresh_token) safeTokens.refresh_token = tokens.refresh_token;
  if (typeof tokens.expiry_date === 'number')
                             safeTokens.expiry_date   = tokens.expiry_date;

  // 5) Byg og returnér user + safeTokens
  const user = {
    _id:          doc._id.toString(),
    email:        doc.email,
    name:         doc.name,
    picture:      doc.picture,
    refreshToken: doc.refreshToken,
    tenantId:     doc.tenantId
  };

  return { user, tokens: safeTokens };
}

/**
 * Henter Google Ads API-klient for en bruger
 * @param user - Bruger med Google Ads adgang
 * @returns En autoriseret kundeinstans fra GoogleAdsApi
 */
export async function getGoogleAccessToken(refreshToken: string): Promise<string> {
  const client = createOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  const { token } = await client.getAccessToken();
  if (!token) throw new Error('Kunne ikke hente access token');
  return token;
}