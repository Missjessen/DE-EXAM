// src/controllers/syncSheetController.ts

import { Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../interfaces/userReq'
import { createOAuthClient } from '../services/googleAuthService'
import { syncAllFromSheet, syncSheetToAds } from '../services/syncSheetToAds'

/**
 * ======================== GET  /api/sync/:sheetId ========================
 * Sync alle data fra et Google Sheet til DB (kampagner, annoncer, keywords osv.)
 * ========================================================================
 */
export const syncDbController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // 1) Tjek authentication + tenantId
  if (!req.user?.refreshToken) {
    res.status(401).json({ error: 'Login kræves' })
    return
  }
  if (!req.tenantId) {
    res.status(400).json({ error: 'Manglende tenantId' })
    return
  }

  const { sheetId } = req.params
  const tenantId    = req.tenantId
  const oauth       = createOAuthClient()
  oauth.setCredentials({ refresh_token: req.user.refreshToken })

  try {
    // 2) Kald service‐lag – inkluderer nu fire argumenter
    const result = await syncAllFromSheet(
      oauth,
      sheetId,
      req.user._id.toString(),
      tenantId      // <<— ekstra parameter
    )

    res.status(200).json(result)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * ======================== GET  /api/sync/ads/:sheetId ========================
 * Sync kun annoncer (Ads) fra et Google Sheet til Google Ads‐API.
 * ========================================================================
 */
export const syncAdsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // 1) Tjek authentication + tenantId
  if (!req.user?.refreshToken) {
    res.status(401).json({ error: 'Login kræves' })
    return
  }
  if (!req.tenantId) {
    res.status(400).json({ error: 'Manglende tenantId' })
    return
  }

  const { sheetId } = req.params
  const tenantId    = req.tenantId
  const oauth       = createOAuthClient()
  oauth.setCredentials({ refresh_token: req.user.refreshToken })

  try {
    // 2) Kald service‐lag – inkluderer nu fire argumenter
    const statuses = await syncSheetToAds(
      oauth,
      sheetId,
      req.user._id.toString(),
      tenantId      // <<— ekstra parameter
    )

    res.status(200).json({ statuses })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * ======================== GET  /api/sync/all-ads/:sheetId ========================
 * Sync alt (DB + Ads) for ét sheet under én request.
 * ========================================================================
 */
export const syncAllAndAdsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // 1) Tjek authentication + tenantId
  if (!req.user?.refreshToken) {
    res.status(401).json({ error: 'Login kræves' })
    return
  }
  if (!req.tenantId) {
    res.status(400).json({ error: 'Manglende tenantId' })
    return
  }

  const { sheetId } = req.params
  const tenantId    = req.tenantId
  const oauth       = createOAuthClient()
  oauth.setCredentials({ refresh_token: req.user.refreshToken })

  try {
    // 2) Sync DB‐delen – nu med fire argumenter
    const dbResult = await syncAllFromSheet(
      oauth,
      sheetId,
      req.user._id.toString(),
      tenantId      // <<— ekstra parameter
    )

    // 3) Sync Ads‐delen – nu med fire argumenter
    const adsStatuses = await syncSheetToAds(
      oauth,
      sheetId,
      req.user._id.toString(),
      tenantId      // <<— ekstra parameter
    )

    res.status(200).json({
      campaignsSynced: dbResult.campaigns,
      adsSynced:      dbResult.ads,
      keywordsSynced: dbResult.keywords,
      adsStatuses
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
