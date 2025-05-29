import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { AdDefModel } from '../models/adDefModel';


/**
 * ==============================================================================================
  * AdDefService
 * ==============================================================================================
 */

interface ParsedAd {
  adGroup:   string;
  headline1: string;
  headline2?:string;
  description:string;
  finalUrl:  string;
  path1?:    string;
  path2?:    string;
  rowIndex:  number;
}
/**
 * Læs annoncer fra Google Sheets og returnér dem som ParsedAd objekter.
 * @param oAuthClient OAuth2Client til autentificering
 * @param sheetId ID for Google Sheet
 * @returns Liste af ParsedAd objekter
 */
export async function parseAdsFromSheet(
  oAuthClient: OAuth2Client,
  sheetId: string
): Promise<ParsedAd[]> {
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Annoncer!A2:F'
  });

  const rows = res.data.values ?? [];

  const parsed: (ParsedAd | null)[] = rows.map((r, i) => {
    const adGroup     = r[0]?.trim() || '';
    const headline1   = r[1]?.trim() || '';
    const description = r[3]?.trim() || '';
    const finalUrl    = r[4]?.trim() || '';

    if (!adGroup || !headline1 || !description) {
      console.warn(`Ignorerer række ${i + 2} – mangler obligatoriske felter`);
      return null;
    }

    const ad: ParsedAd = {
      adGroup,
      headline1,
      description,
      finalUrl,
      rowIndex: i + 2
    };

    // Kun tilføj valgfri felter hvis de findes
    if (r[2]) ad.headline2 = r[2].trim();
    if (r[5]) ad.path1 = r[5].trim();

    return ad;
  });

  return parsed.filter((a): a is ParsedAd => a !== null);
}

/**
 * Synkroniser annoncer fra Google Sheets til MongoDB.
 * @param oAuthClient OAuth2Client til autentificering
 * @param sheetId ID for Google Sheet
 * @param userId ID for bruger
 * @returns Liste af ParsedAd objekter
 */
export async function syncAdDefsFromSheet(
  oAuthClient: OAuth2Client,
  sheetId: string,
  userId: string
): Promise<ParsedAd[]> {
  const parsed = await parseAdsFromSheet(oAuthClient, sheetId);
  console.log('Antal parsed ads:', parsed.length);

  await AdDefModel.deleteMany({ sheetId, userId });

  try {
    await AdDefModel.insertMany(parsed.map(a => ({
      userId,
      sheetId,
      adGroup:     a.adGroup,
      headline1:   a.headline1,
      headline2:   a.headline2,
      description: a.description,
      finalUrl:    a.finalUrl,
      path1:       a.path1,
      path2:       a.path2,
      rowIndex:    a.rowIndex,
      createdAt:   new Date()
    })), { ordered: false }); // fortsæt selv hvis én fejler
  } catch (err) {
    console.error('insertMany fejlede:', err);
  }

  return parsed;
}

/**
 * Opdater en annonce i Google Sheets.
 * @param oAuthClient OAuth2Client til autentificering
 * @param sheetId ID for Google Sheet
 * @param adId ID for annoncen
 * @param updates Opdateringer til annoncen
 */
export async function updateAdRowInSheet(
  oAuthClient: OAuth2Client,
  sheetId: string,
  adId: string,
  updates: Partial<ParsedAd>
): Promise<void> {
  const doc = await AdDefModel.findById(adId).lean();
  if (!doc?.rowIndex) return;

  const row = doc.rowIndex;
  const sheets = google.sheets({ version:'v4', auth: oAuthClient });
  const data = [];

  if (updates.adGroup)    data.push({ range:`Annoncer!A${row}`, values:[[updates.adGroup]] });
  if (updates.headline1)  data.push({ range:`Annoncer!B${row}`, values:[[updates.headline1]] });
  if (updates.headline2)  data.push({ range:`Annoncer!C${row}`, values:[[updates.headline2]] });
  if (updates.description)data.push({ range:`Annoncer!D${row}`, values:[[updates.description]] });
  if (updates.finalUrl)   data.push({ range:`Annoncer!E${row}`, values:[[updates.finalUrl]] });
  if (updates.path1)      data.push({ range:`Annoncer!F${row}`, values:[[updates.path1]] });

  if (data.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { valueInputOption:'RAW', data }
    });
  }
}

export async function deleteAdRowInSheet(
  oAuthClient: OAuth2Client,
  sheetId: string,
  rowIndex: number
): Promise<void> {
  const sheets = google.sheets({ version:'v4', auth: oAuthClient });
  const info   = await sheets.spreadsheets.get({ spreadsheetId: sheetId });
  const tabId  = info.data.sheets!
    .find(s => s.properties!.title === 'Annoncer')!
    .properties!.sheetId!;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId: tabId, dimension: 'ROWS', startIndex: rowIndex-1, endIndex: rowIndex }
        }
      }]
    }
  });
}
