// src/services/keywordDefsService.ts

import { OAuth2Client } from 'google-auth-library'
import { KeywordDefModel } from '../models/keywordDefModel'
import { google } from 'googleapis'
import { Types } from 'mongoose'

// 1) parseKeywordsFromSheet – læs keywords fra Google Sheets
interface ParsedKeyword {
  adGroup:   string
  keyword:   string
  matchType: 'BROAD' | 'PHRASE' | 'EXACT'
  cpc?:      number
  rowIndex:  number
}

/**
 * Læs keywords fra Google Sheets og returnér dem som ParsedKeyword objekter.
 * @param oAuthClient OAuth2Client til autentificering
 * @param sheetId ID for Google Sheet
 * @returns Liste af ParsedKeyword objekter
 */
export async function parseKeywordsFromSheet(
  oAuthClient: OAuth2Client,
  sheetId: string
): Promise<ParsedKeyword[]> {
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient })
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Keywords!A2:D'
  })

  const rows = res.data.values || []

  return rows
    .map((r, i) => {
      const adGroup = r[0]?.trim() || ''
      const keyword = r[1]?.trim() || ''
      const matchRaw = r[2]
      const matchType =
        typeof matchRaw === 'string' && ['BROAD', 'PHRASE', 'EXACT'].includes(matchRaw.toUpperCase())
          ? (matchRaw.toUpperCase() as ParsedKeyword['matchType'])
          : 'BROAD'
      const cpc = r[3] && !isNaN(Number(r[3])) ? Number(r[3]) : undefined

      return {
        adGroup,
        keyword,
        matchType,
        cpc,
        rowIndex: i + 2
      }
    })
    .filter((k) => k.adGroup && k.keyword)
}

// 2) syncKeywordDefsFromSheet – opdater DB med keywords fra Google Sheets
export async function syncKeywordDefsFromSheet(
  oAuthClient: OAuth2Client,
  sheetId: string,
  userId: string,
  tenantId: string    // <<— ekstra parameter
): Promise<ParsedKeyword[]> {
  // Læs alle keywords fra Google Sheets
  const parsed = await parseKeywordsFromSheet(oAuthClient, sheetId)

  // 1) Slet eksisterende keywords for denne tenant + user + sheet
  await KeywordDefModel.deleteMany({
    tenantId,
    userId: new Types.ObjectId(userId),
    sheetId
  })

  // 2) Indsæt alle parsed keywords – husk tenantId
  const toInsert = parsed.map((k) => ({
    tenantId,
    userId:    new Types.ObjectId(userId),
    sheetId,
    adGroup:   k.adGroup,
    keyword:   k.keyword,
    matchType: k.matchType,
    cpc:       k.cpc,
    rowIndex:  k.rowIndex,
    createdAt: new Date()
  }))

  if (toInsert.length) {
    await KeywordDefModel.insertMany(toInsert)
  }

  return parsed
}

// 3) updateKeywordRowInSheet – skriv enkelt‐celle opdateringer
export async function updateKeywordRowInSheet(
  oAuthClient: OAuth2Client,
  sheetId: string,
  keywordId: string,
  updates: Partial<{ adGroup: string; keyword: string; matchType: string; cpc: number }>
): Promise<void> {
  // Hent rowIndex fra DB, filtreret på tenantId også
  const doc = await KeywordDefModel.findById(keywordId).lean()
  if (!doc?.rowIndex) return
  const row = doc.rowIndex

  const sheets = google.sheets({ version: 'v4', auth: oAuthClient })
  const data: { range: string; values: unknown[][] }[] = []

  if (updates.adGroup)   data.push({ range: `Keywords!A${row}`, values: [[updates.adGroup]] })
  if (updates.keyword)   data.push({ range: `Keywords!B${row}`, values: [[updates.keyword]] })
  if (updates.matchType) data.push({ range: `Keywords!C${row}`, values: [[updates.matchType]] })
  if (updates.cpc != null) data.push({ range: `Keywords!D${row}`, values: [[updates.cpc]] })

  if (data.length) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { valueInputOption: 'RAW', data }
    })
  }
}

// 4) deleteKeywordRowInSheet – slet én række med deleteDimension
export async function deleteKeywordRowInSheet(
  oAuthClient: OAuth2Client,
  sheetId: string,
  rowIndex: number
): Promise<void> {
  // Find den interne fanes sheetId
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient })
  const meta = await sheets.spreadsheets.get({ spreadsheetId: sheetId })
  const kwSheet = meta.data.sheets?.find((s) => s.properties?.title === 'Keywords')
  if (!kwSheet) return
  const tabId = kwSheet.properties!.sheetId!

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId:    tabId,
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
