// src/controllers/keywordDefsController.ts

import { RequestHandler } from 'express'
import { KeywordDefModel } from '../models/keywordDefModel'
import { AuthenticatedRequest } from '../interfaces/userReq'
import { syncKeywordDefsFromSheet } from '../services/keywordDefsService'
import { createOAuthClient } from '../services/googleAuthService'
import {
  updateKeywordRowInSheet,
  deleteKeywordRowInSheet
} from '../services/keywordDefsService'

/**
 * ==============================================================================================
 * GET /api/keyword-defs/:sheetId
 * Hent alle keywords for en given bruger + tenant
 * ==============================================================================================
 */
export const getKeywordsForSheet: RequestHandler = async (req, res) => {
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
    const docs = await KeywordDefModel
      .find({ tenantId, sheetId, userId: user._id })
      .lean()
      .exec()
    res.json(docs)
    return
  } catch (err: any) {
    res.status(500).json({ error: err.message })
    return
  }
}

/**
 * ==============================================================================================
 * PUT /api/keyword-defs/:sheetId/:keywordId
 * Opdater et enkelt keyword (i både DB og Google Sheet)
 * ==============================================================================================
 */
export const updateKeyword: RequestHandler = async (req, res) => {
  const user     = (req as AuthenticatedRequest).user!
  const tenantId = (req as AuthenticatedRequest).tenantId!
  const { sheetId, keywordId } = req.params
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
   
    const doc = await KeywordDefModel.findOneAndUpdate(
      { tenantId, userId: user._id, sheetId, _id: keywordId },
      updates,
      { new: true, lean: true }
    )

    if (!doc) {
      res.status(404).json({ error: 'Keyword ikke fundet' })
      return
    }

    // Opdater i Google Sheet (rækkeret)
    try {
      const oauth = createOAuthClient()
      oauth.setCredentials({ refresh_token: user.refreshToken })
      await updateKeywordRowInSheet(
        oauth,
        sheetId,
        doc.rowIndex?.toString() || '',
        updates
      )
    } catch (e: any) {
      console.warn('Kunne ikke opdatere Keyword-række i Sheet:', e.message)
    }

    // Returnér opdateret dokument
    res.json(doc)
    return
  } catch (err: any) {
    res.status(500).json({ error: err.message })
    return
  }
}

/**
 * ==============================================================================================
 * DELETE /api/keyword-defs/:sheetId/:keywordId
 * Slet et keyword i både DB og Google Sheet
 * ==============================================================================================
 */
export const deleteKeyword: RequestHandler = async (req, res) => {
  const user     = (req as AuthenticatedRequest).user!
  const tenantId = (req as AuthenticatedRequest).tenantId!
  const { sheetId, keywordId } = req.params

  if (!user?.refreshToken) {
    res.status(401).json({ error: 'Login kræves' })
    return
  }
  if (!tenantId) {
    res.status(400).json({ error: 'Manglende tenantId' })
    return
  }

  try {
    //Hent dokumentet inkl. rowIndex (med tenantId‐filter)
    const doc = await KeywordDefModel
      .findOne({ tenantId, sheetId, userId: user._id, _id: keywordId })
      .lean()

    if (!doc) {
      res.status(404).json({ error: 'Keyword ikke fundet' })
      return
    }

   
    const rowIndex = doc.rowIndex
    if (typeof rowIndex !== 'number') {
      res.status(500).json({ error: 'Ingen rowIndex i DB-dokument' })
      return
    }

  
    try {
      const oauth = createOAuthClient()
      oauth.setCredentials({ refresh_token: user.refreshToken })
      await deleteKeywordRowInSheet(oauth, sheetId, rowIndex)
    } catch (err: any) {
      console.warn('Kunne ikke slette Keyword-række i Sheet:', err.message)
    }

   
    await KeywordDefModel.deleteOne({
      tenantId,
      sheetId,
      userId: user._id,
      _id: keywordId
    })

    res.json({ message: 'Keyword slettet i både Sheet og DB' })
    return
  } catch (err: any) {
    res.status(500).json({ error: err.message })
    return
  }
}

/**
 * ==============================================================================================
 * POST /api/keyword-defs/:sheetId/sync
 * Synkroniser alle keywords fra Google Sheet til DB (overskriv)
 * Bemærk: syncKeywordDefsFromSheet forventer nu også tenantId
 * ==============================================================================================
 */
export const syncKeywords: RequestHandler = async (req, res) => {
  const user     = (req as AuthenticatedRequest).user!
  const tenantId = (req as AuthenticatedRequest).tenantId!
  const { sheetId } = req.params

  if (!user || !user.refreshToken) {
    res.status(401).json({ error: 'Login kræves' })
    return
  }
  if (!tenantId) {
    res.status(400).json({ error: 'Manglende tenantId' })
    return
  }

  const oauth = createOAuthClient()
  oauth.setCredentials({ refresh_token: user.refreshToken })

  try {
   
    const parsed = await syncKeywordDefsFromSheet(
      oauth,
      sheetId,
      user._id.toString(),
      tenantId  
    )
    
    res.json({ status: 'OK', updated: parsed.length })
    return
  } catch (err: any) {
    res.status(500).json({ error: err.message })
    return
  }
}
