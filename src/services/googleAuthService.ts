// services/googleAuthService.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { iUserModel } from '../models/iUserModel';
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
export async function verifyGoogleCode(code: string) {
  const client = createOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const { data } = await oauth2.userinfo.get(); // 👈 indeholder navn og billede

  // Upsert på iUserModel
  let user = await iUserModel.findOne({ googleId: data.id });
  if (!user) {
    user = new iUserModel({
      email: data.email,
      googleId: data.id,
      name: data.name,         
      picture: data.picture,
      refreshToken: tokens.refresh_token!,
      accessToken: tokens.access_token!,
      expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined
    });
  } else {
    user.accessToken = tokens.access_token!;
    if (tokens.refresh_token) user.refreshToken = tokens.refresh_token;
    if (tokens.expiry_date) user.expiryDate = new Date(tokens.expiry_date);
  }

  await user.save();

  // Tilføj navn og billede fra Google til det objekt du returnerer
return {
  user: {
    ...user.toObject(),
    name: data.name,
    picture: data.picture,
    accessToken: tokens.access_token // 👈 denne linje er nødvendig
  },
  tokens
}
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