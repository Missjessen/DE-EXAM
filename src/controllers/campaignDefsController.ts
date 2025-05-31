// src/controllers/campaignDefsController.ts
import { RequestHandler } from 'express'
import { CampaignDefModel } from '../models/CampaignDefModel'
import { AuthenticatedRequest } from '../interfaces/userReq'
import { syncCampaignDefsFromSheet } from '../services/campaignDefsService'
import { createOAuthClient } from '../services/googleAuthService'
import { updateCampaignRowInSheet, deleteCampaignRowInSheet } from '../services/campaignDefsService'

/**
 * ======================== GET  /api/campaign-defs/:sheetId ========================
 * Hent alle kampagner for én sheet under den rigtige tenant + bruger.
 */
export const getCampaignsForSheet: RequestHandler = async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const user = authReq.user
  const tenantId = authReq.tenantId
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
    const docs = await CampaignDefModel.find({
      tenantId,
      userId: user._id,
      sheetId
    })
      .lean()
      .exec()
    res.json(docs)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

/**
 * ======================== PUT  /api/campaign-defs/:sheetId/:campaignId ========================
 * Opdater én kampagne både i MongoDB og i Google Sheet.
 */
export const updateCampaign: RequestHandler = async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const user = authReq.user
  const tenantId = authReq.tenantId
  const { sheetId, campaignId } = req.params
  const updates = req.body

  if (!user || !user.refreshToken) {
    res.status(401).json({ error: 'Login kræves' })
    return
  }
  if (!tenantId) {
    res.status(400).json({ error: 'Manglende tenantId' })
    return
  }

  // 1) Opdatér i MongoDB: findOneAndUpdate med tenantId + userId + _id
  let doc
  try {
    doc = await CampaignDefModel.findOneAndUpdate(
      { _id: campaignId, tenantId, userId: user._id, sheetId },
      updates,
      { new: true, lean: true }
    )
    if (!doc) {
      res.status(404).json({ error: 'Kampagne ikke fundet' })
      return
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message })
    return
  }

  // 2) Opdatér i Google Sheet (kun rækken) – bruger rowIndex fra det opdaterede doc
  try {
    const oauth = createOAuthClient()
    oauth.setCredentials({ refresh_token: user.refreshToken })
    await updateCampaignRowInSheet(
      oauth,
      sheetId,
      doc.rowIndex,
      {
        name:      updates.name,
        status:    updates.status,
        budget:    updates.budget,
        startDate: updates.startDate,
        endDate:   updates.endDate
      }
    )
  } catch (e: any) {
    console.warn('Kunne ikke opdatere Sheet-række:', e.message)
  }

  res.json(doc)
}

/**
 * ======================== DELETE  /api/campaign-defs/:sheetId/:campaignId ========================
 * Slet én kampagne både i MongoDB og i Google Sheet.
 */
export const deleteCampaign: RequestHandler = async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const user = authReq.user
  const tenantId = authReq.tenantId
  const { sheetId, campaignId } = req.params

  if (!user || !user.refreshToken) {
    res.status(401).json({ error: 'Login kræves' })
    return
  }
  if (!tenantId) {
    res.status(400).json({ error: 'Manglende tenantId' })
    return
  }

  // 1) Find dokumentet (for at hente rowIndex) og slet i Mongo med tenantId+userId+_id
  let rowIndex: number
  try {
    const doc = await CampaignDefModel.findOne({
      _id: campaignId,
      tenantId,
      userId: user._id,
      sheetId
    }).lean()
    if (!doc) {
      res.status(404).json({ error: 'Kampagne ikke fundet' })
      return
    }
    rowIndex = doc.rowIndex
    await CampaignDefModel.deleteOne({
      _id: campaignId,
      tenantId,
      userId: user._id,
      sheetId
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
    return
  }

  // 2) Slet rækken i Google Sheet
  try {
    const oauth = createOAuthClient()
    oauth.setCredentials({ refresh_token: user.refreshToken })
    await deleteCampaignRowInSheet(oauth, sheetId, rowIndex)
  } catch (e: any) {
    console.warn('Kunne ikke slette række i Sheet:', e.message)
  }

  res.json({ message: 'Kampagne slettet' })
}

/**
 * ======================== POST /api/campaign-defs/:sheetId/sync-db ========================
 * Pull alle kampagner fra Sheets og gemmer/overskriver i databasen.
 */
export const syncCampaignDefs: RequestHandler = async (req, res) => {
  const authReq = req as AuthenticatedRequest
  const user = authReq.user
  const tenantId = authReq.tenantId
  const { sheetId } = req.params

  if (!user || !user.refreshToken) {
    res.status(401).json({ error: 'Login kræves' })
    return
  }
  if (!tenantId) {
    res.status(400).json({ error: 'Manglende tenantId' })
    return
  }

  // 1) Opret OAuth2‐client med brugerens refreshToken
  const oauth = createOAuthClient()
  oauth.setCredentials({ refresh_token: user.refreshToken })
  

  // 2) Kald service‐laget med tenantId
  try {
    const parsed = await syncCampaignDefsFromSheet(
      oauth,
      sheetId,
      user._id.toString(),
      tenantId   // <<— tilføjet her
    )
    res.json({ synced: parsed.length, data: parsed })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
