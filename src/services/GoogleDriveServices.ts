// src/modules/sheets/services/GoogleDriveDriveAPI.ts
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

function createAuthClient(refreshToken: string): OAuth2Client {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID!,
    process.env.GOOGLE_CLIENT_SECRET!,
    process.env.GOOGLE_REDIRECT_URI!
  )
  client.setCredentials({ refresh_token: refreshToken })
  return client
}

export async function listUserSheets(refreshToken: string) {
  const auth  = createAuthClient(refreshToken)
  const drive = google.drive({ version: 'v3', auth })

  // Drive API: filtrér kun Sheets (mimeType) og undgå slettede
  const res = await drive.files.list({
    q:       "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
    fields:  'files(id, name)',
    pageSize: 50
  })

  return res.data.files || []
}
