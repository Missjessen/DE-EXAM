// src/services/googleSheets/campaignSheetService.ts

import { google } from 'googleapis'
import type { OAuth2Client } from 'google-auth-library'
import { CampaignDefModel } from '../models/CampaignDefModel'
import type { ICampaignDef } from '../interfaces/iCampaignDef'
import { Types } from 'mongoose'

/**
 * Interfacet vi parser fra arket, inkl. rowIndex
 */
interface ParsedCampaign {
  name: string
  status: 'ENABLED' | 'PAUSED'
  budget?: number
  startDate: string
  endDate: string
  rowIndex: number
}

/**
 * Parser kampagner fra Google Sheets.
 * Returnerer en liste af ParsedCampaigns.
 */
export async function parseCampaignsFromSheet(
  oauth: OAuth2Client,
  sheetId: string
): Promise<ParsedCampaign[]> {
  const sheets = google.sheets({ version: 'v4', auth: oauth });
  const res = await sheets.spreadsheets.values.get({ /* … */ });
  const rows = res.data.values || [];

  return rows
    .map((r, i) => {
      const name = r[0]?.trim() || '';
      const statusRaw = r[1];
      // Her falder status måske ud som almindelig “string”
      const status = (typeof statusRaw === 'string' && statusRaw.toUpperCase() === 'PAUSED'
        ? 'PAUSED'
        : 'ENABLED') as 'PAUSED' | 'ENABLED';

      const budget = r[2] && !isNaN(Number(r[2])) ? Number(r[2]) : undefined;
      const startDate = r[3]?.trim() || '';
      const endDate = r[4]?.trim() || '';

      return {
        name,
        status,       
        budget,
        startDate,
        endDate,
        rowIndex: i + 2
      };
    })
    .filter(c => c.name && c.startDate && c.endDate);
}
/**
 * Synkroniser kampagne‐definitioner fra Google Sheets til MongoDB.
 *
 * @param oauth    
 * @param sheetId 
 * @param userId   
 * @param tenantId 
 * @returns        
 */
export async function syncCampaignDefsFromSheet(
  oauth: OAuth2Client,
  sheetId: string,
  userId: string,
  tenantId: string
): Promise<ParsedCampaign[]> {
  
  const parsed = await parseCampaignsFromSheet(oauth, sheetId)

  
  await CampaignDefModel.deleteMany({
    tenantId,                        // nu med i filter
    userId: new Types.ObjectId(userId),
    sheetId
  })

  // 3) Byg et array af objekter, der matcher Omit<ICampaignDef, '_id'>
  //    Bemærk: Vi tilføjer tenantId i hvert enkelt objekt her
  const toInsert: Array<Omit<ICampaignDef, '_id'>> = parsed.map(c => ({
    tenantId,                       // <<— vigtig tilføjelse
    userId: new Types.ObjectId(userId),
    sheetId,
    campaignId: String(c.rowIndex),
    name: c.name,
    status: c.status,
    budget: c.budget!,
    startDate: c.startDate,
    endDate: c.endDate,
    rowIndex: c.rowIndex,
    createdAt: new Date()
  } as Omit<ICampaignDef, '_id'>))

  
  await CampaignDefModel.insertMany(toInsert)

  
  return parsed
}

/**
 * Opdaterer en enkelt række i Google Sheets.
 * @param oAuthClient OAuth2Client til autentificering
 * @param sheetId     ID for Google Sheet
 * @param rowIndex    Indeks for rækken, der skal opdateres (1‐baseret)
 * @param updates     Hvilke felter, der skal opdateres (name, status, budget, startDate, endDate)
 */
export async function updateCampaignRowInSheet(
  oAuthClient: OAuth2Client,
  sheetId: string,
  rowIndex: number,
  updates: Partial<{
    name: string
    status: string
    budget: number
    startDate: string
    endDate: string
  }>
): Promise<void> {
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient })
  const data: any[] = []

  if (updates.name)      data.push({ range: `Kampagner!A${rowIndex}`, values: [[updates.name]] })
  if (updates.status)    data.push({ range: `Kampagner!B${rowIndex}`, values: [[updates.status]] })
  if (updates.budget != null) data.push({ range: `Kampagner!C${rowIndex}`, values: [[updates.budget]] })
  if (updates.startDate) data.push({ range: `Kampagner!D${rowIndex}`, values: [[updates.startDate]] })
  if (updates.endDate)   data.push({ range: `Kampagner!E${rowIndex}`, values: [[updates.endDate]] })

  if (data.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { valueInputOption: 'RAW', data }
    })
  }
}

/**
 * Sletter en enkelt række i Google Sheets.
 * @param oAuthClient 
 * @param sheetId     
 * @param rowIndex    Indeks for rækken, der skal slettes (1‐baseret)
 */
export async function deleteCampaignRowInSheet(
  oAuthClient: OAuth2Client,
  sheetId: string,
  rowIndex: number
): Promise<void> {
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient })
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId })
  const kampagneSheetId = meta.data.sheets!
    .find(s => s.properties!.title === 'Kampagner')!
    .properties!.sheetId!

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId:    kampagneSheetId,
              dimension:  'ROWS',
              startIndex: rowIndex - 1,
              endIndex:   rowIndex
            }
          }
        }
      ]
    }
  })
}
