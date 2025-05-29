// src/controllers/sheetsController.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../interfaces/userReq';
import { createOAuthClient } from '../services/googleAuthService';
import { syncAllFromSheet } from '../services/syncSheetToAds';
import { syncSheetToAds }   from '../services/syncSheetToAds';



/**
 * ======================== GET /api/sync/:sheetId ========================
 * Sync all data from a Google Sheet to the database and Ads
 * ========================================================================
 */
export const syncDbController = 
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    // 1) Tjek authentication
    if (!req.user?.refreshToken) {
      res.status(401).json({ error: 'Login kræves' });
      return;
    }

    const { sheetId } = req.params;
    const oauth       = createOAuthClient();
    oauth.setCredentials({ refresh_token: req.user.refreshToken });

    try {
      const result = await syncAllFromSheet(oauth, sheetId, req.user._id.toString());
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    } 
};

/**
 * ======================== GET /api/sync/ads/:sheetId ========================
 * Sync all data from a Google Sheet to Ads
 * ========================================================================
 */
export const syncAdsController = 
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.refreshToken) {
      res.status(401).json({ error: 'Login kræves' });
      return;
    }

    const { sheetId } = req.params;
    const oauth       = createOAuthClient();
    oauth.setCredentials({ refresh_token: req.user.refreshToken });

    try {
      
      const statuses = await syncSheetToAds(oauth, sheetId, req.user._id.toString());
      res.status(200).json({ statuses });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    } 
};

/**
 * ======================== GET /api/sync/all-ads/:sheetId ========================
 * Sync all data from a Google Sheet to the database and Ads
 * ========================================================================
 */
export const syncAllAndAdsController = 
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user?.refreshToken) {
      res.status(401).json({ error: 'Login kræves' });
      return;
    }

    const { sheetId } = req.params;
    const oauth       = createOAuthClient();
    oauth.setCredentials({ refresh_token: req.user.refreshToken });

    try {
      const dbResult    = await syncAllFromSheet(oauth, sheetId, req.user._id.toString());
      const adsStatuses = await syncSheetToAds(oauth, sheetId, req.user._id.toString());
      res.status(200).json({
        campaignsSynced: dbResult.campaigns,
        adsSynced:      dbResult.ads,
        keywordsSynced: dbResult.keywords,
        adsStatuses,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    } 
};