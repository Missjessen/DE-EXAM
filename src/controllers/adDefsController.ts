// src/controllers/adDefsController.ts

import { RequestHandler } from 'express'
import { AdDefModel } from '../models/adDefModel'
import { AuthenticatedRequest } from '../interfaces/userReq'
import {
  syncAdDefsFromSheet,
  updateAdRowInSheet,
  deleteAdRowInSheet,
} from '../services/adDefsService'
import { createOAuthClient } from '../services/googleAuthService'

/**
 * ======================== GET /api/ad-defs/:sheetId ========================
 * Hent alle annoncer for en given bruger + tenant
 */
export const getAdsForSheet: RequestHandler = async (req, res) => {
  const user     = (req as AuthenticatedRequest).user!
  const tenantId = (req as AuthenticatedRequest).tenantId!
  const { sheetId } = req.params

  if (!user) {
    res.status(401).json({ error: 'Login kræves' })
    return
  }
  if (!tenantId) {
    res.status(400).json({ error: 'Manglende tenantId' })
    return
  }

  try {
    const docs = await AdDefModel
      .find({ tenantId, sheetId, userId: user._id })
      .lean()
      .exec()

    res.json(docs)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * ======================== PUT /api/ad-defs/:sheetId/:adId ========================
 * Opdater en enkelt annonce (i både DB og Google Sheet)
 */
export const updateAd: RequestHandler = async (req, res) => {
  const user     = (req as AuthenticatedRequest).user!
  const tenantId = (req as AuthenticatedRequest).tenantId!
  const { sheetId, adId } = req.params
  const updates = req.body

  if (!user || !user.refreshToken) {
    res.status(401).json({ error: 'Login kræves' })
    return
  }
  if (!tenantId) {
    res.status(400).json({ error: 'Manglende tenantId' })
    return
  }

  try {
    // 1) Opdater i MongoDB kun hvis tenantId + userId + sheetId + adId matcher
    const doc = await AdDefModel.findOneAndUpdate(
      { _id: adId, tenantId, userId: user._id, sheetId },
      updates,
      { new: true, lean: true }
    )
    if (!doc) {
      res.status(404).json({ error: 'Annonce ikke fundet' })
      return
    }

    // 2) Opdater i Google Sheet
    try {
      const oauth = createOAuthClient()
      oauth.setCredentials({ refresh_token: user.refreshToken })
      await updateAdRowInSheet(oauth, sheetId, adId, updates)
    } catch (e: any) {
      console.warn('Kunne ikke opdatere annonce-række i Sheet:', e.message)
    }

    // 3) Returnér opdateret dokument
    res.json(doc)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * ======================== DELETE /api/ad-defs/:sheetId/:adId ========================
 * Slet en annonce i både DB og Google Sheet
 */
export const deleteAd: RequestHandler = async (req, res) => {
  const user     = (req as AuthenticatedRequest).user!
  const tenantId = (req as AuthenticatedRequest).tenantId!
  const { sheetId, adId } = req.params

  if (!user?.refreshToken) {
    res.status(401).json({ error: 'Login kræves' })
    return
  }
  if (!tenantId) {
    res.status(400).json({ error: 'Manglende tenantId' })
    return
  }

  try {
    // 1) Hent annonce fra DB inkl. tenantId‐filter
    const doc = await AdDefModel
      .findOne({ _id: adId, tenantId, userId: user._id, sheetId })
      .lean()
      .exec()

    if (!doc) {
      res.status(404).json({ error: 'Annonce ikke fundet' })
      return
    }
    if (typeof doc.rowIndex !== 'number') {
      res.status(500).json({ error: 'Kan ikke finde række-index for annoncen' })
      return
    }

    // 2) Slet rækken i Google Sheet
    try {
      const oauth = createOAuthClient()
      oauth.setCredentials({ refresh_token: user.refreshToken })
      await deleteAdRowInSheet(oauth, sheetId, doc.rowIndex)
    } catch (err: any) {
      console.warn('Kunne ikke slette annonce-række i Sheet:', err.message)
    }

    // 3) Slet annoncen i DB (med tenantId‐filter)
    await AdDefModel.deleteOne({
      _id: adId,
      tenantId,
      userId: user._id,
      sheetId,
    })

    // 4) Returnér bekræftelse
    res.json({ message: 'Annonce slettet' })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * ======================== POST /api/ad-defs/:sheetId/sync-db ========================
 * Synkroniser alle annoncer fra Google Sheet til DB for denne tenant + bruger
 */
export const syncAds: RequestHandler = async (req, res) => {
  const user     = (req as AuthenticatedRequest).user!
  const tenantId = (req as AuthenticatedRequest).tenantId!
  const { sheetId } = req.params

  if (!user.refreshToken) {
    res.status(401).json({ error: 'Login kræves' })
    return
  }
  if (!tenantId) {
    res.status(400).json({ error: 'Manglende tenantId' })
    return
  }

  try {
    // 1) Opret OAuth2‐client og sæt token
    const oauth = createOAuthClient()
    oauth.setCredentials({ refresh_token: user.refreshToken })

    // 2) Kald service med tenantId som ekstra argument
    const parsed = await syncAdDefsFromSheet(
      oauth,
      sheetId,
      user._id.toString(),
      tenantId    // <<— tilsæt tenantId her
    )

    // 3) Returnér antal synkroniserede annoncer
    res.json({ synced: parsed.length })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
