
// services/syncSheetToAds.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Types } from 'mongoose';
import { CampaignDefModel } from '../models/CampaignDefModel';
import {
  callAdsApiCampaignMutate,
  callAdsApiAdGroupMutate,
  callAdsApiAdMutate,
  callAdsApiCriterionMutate
} from '../services/adsService';
import { syncCampaignDefsFromSheet } from '../services/campaignDefsService';
import { syncAdDefsFromSheet }       from '../services/adDefsService';
import { syncKeywordDefsFromSheet }  from '../services/keywordDefsService';


/**
 * Synkroniserer data fra Google Sheets til Google Ads.
 * Læser data fra arket og opdaterer kampagner, annoncegrupper, annoncer og kriterier i Google Ads.
 * @param oAuthClient OAuth2Client til autentificering
 * @param spreadsheetId ID for Google Sheets
 * @param userId ID for brugeren
 * @returns Liste af statusser for hver række
 */
export async function syncSheetToAds(
  oAuthClient: OAuth2Client,
  spreadsheetId: string,
  userId: string
): Promise<string[]> {
  const sheets = google.sheets({ version: 'v4', auth: oAuthClient });
  const res    = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'AllResources!A2:P1000'
  });
  const rows = res.data.values || [];
  if (!rows.length) return [];

  const campaignOps: any[] = [];
  const adGroupOps: any[]  = [];
  const adOps: any[]       = [];
  const criterionOps: any[] = [];

  const statuses: string[] = [];

  for (const row of rows) {
    const [
      resourceType, id, parentId, name, budget, status,
      startDate, endDate, headline1, headline2,
      description, finalUrl, keywordText, matchType,
      action
    ] = row;

    if (!action) {
      statuses.push('No action');
      continue;
    }

    try {
      if (resourceType === 'campaign') {
        await CampaignDefModel.findOneAndUpdate(
          { sheetId: spreadsheetId, id },
          {
            userId:    new Types.ObjectId(userId),
            sheetId:   spreadsheetId,
            id,
            name,
            status,
            startDate,
            endDate
          },
          { upsert: true, new: true }
        );
        campaignOps.push({ id, name, budget, status, startDate, endDate, action });
      } else if (resourceType === 'adGroup') {
        adGroupOps.push({ id, parentId, name, status, action });
      } else if (resourceType === 'ad') {
        adOps.push({ parentId, headline1, headline2, description, finalUrl, action });
      } else if (resourceType === 'keyword') {
        criterionOps.push({ parentId, keywordText, matchType, action });
      }
      statuses.push('Pending');
    } catch (err: any) {
      statuses.push(`Error: ${err.message}`);
    }
  }

  // Kør batch-mutate i Google Ads API
  await Promise.all([
    callAdsApiCampaignMutate(campaignOps),
    callAdsApiAdGroupMutate(adGroupOps),
    callAdsApiAdMutate(adOps),
    callAdsApiCriterionMutate(criterionOps),
  ]);

  // Opdater sheet med de nye statusser
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `AllResources!P2:P${statuses.length + 1}`,
    valueInputOption: 'RAW',
    requestBody: { values: statuses.map(s => [s]) }
  });

  return statuses;
}

/**
 * Synkroniserer alle kampagner, annoncer og søgeord fra Google Sheets til Google Ads.
 * @param oAuthClient OAuth2Client til autentificering
 * @param sheetId ID for Google Sheets
 * @param userId ID for brugeren
 * @returns Antal synkroniserede kampagner, annoncer og søgeord
 */
export async function syncAllFromSheet(
  oAuthClient: OAuth2Client,
  sheetId:      string,
  userId:       string
): Promise<{ campaigns: number; ads: number; keywords: number }> {
  const [campNames, adsDefs, keywordDefs] = await Promise.all([
    syncCampaignDefsFromSheet(oAuthClient, sheetId, userId),
    syncAdDefsFromSheet      (oAuthClient, sheetId, userId),
    syncKeywordDefsFromSheet (oAuthClient, sheetId, userId),
  ]);

  return {
    campaigns: campNames.length,
    ads:        adsDefs.length,
    keywords:   keywordDefs.length,
  };
}