// src/controllers/keywordDefsController.ts
import { RequestHandler } from 'express';
import { KeywordDefModel } from '../models/keywordDefModel';
import { AuthenticatedRequest } from '../interfaces/userReq';
import { syncKeywordDefsFromSheet } from '../services/keywordDefsService';
import { createOAuthClient } from '../services/googleAuthService';

import {
  updateKeywordRowInSheet,
  deleteKeywordRowInSheet
} from '../services/keywordDefsService';



/**
 * ==============================================================================================
 * GET /api/keyword-defs/:sheetId
 * ==============================================================================================
 */
export const getKeywordsForSheet: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user!;
  const { sheetId } = req.params;

  if (!user) {
    res.status(401).json({ error: 'Login kræves' });
    return;
  }

 
  try {
    const docs = await KeywordDefModel
      .find({ sheetId, userId: user._id })
      .lean()
      .exec();
    res.json(docs);
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  } 
};


/**
 * ==============================================================================================
 * PUT /api/keyword-defs/:sheetId/:keywordId
 * ==============================================================================================
 */
export const updateKeyword: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user!;
  const { sheetId, keywordId } = req.params;
  const updates = req.body;

  if (!user || !user.refreshToken) {
    res.status(401).json({ error: 'Login kræves' });
    return;
  }

  try {
    const doc = await KeywordDefModel.findOneAndUpdate(
      { _id: keywordId, sheetId, userId: user._id },
      updates,
      { new: true, lean: true }
    );

    if (!doc) {
      res.status(404).json({ error: 'Keyword ikke fundet' });
      return;
    }

    // 1) Opdater i Google Sheet
    try {
      const oauth = createOAuthClient();
      oauth.setCredentials({ refresh_token: user.refreshToken });
      await updateKeywordRowInSheet(oauth, sheetId, keywordId, updates);
    } catch (e: any) {
      console.warn('Kunne ikke opdatere Keyword-række i Sheet:', e.message);
    }

    // 2) Returnér den opdaterede DB-doc
    res.json(doc);
    return;

  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  } 
};

/**
 * ==============================================================================================
 * DELETE /api/keyword-defs/:sheetId/:keywordId
 * ==============================================================================================
 */
export const deleteKeyword: RequestHandler = async (req, res): Promise<void> => {
    const user = (req as AuthenticatedRequest).user;
    const { sheetId, keywordId } = req.params;
    if (!user?.refreshToken) {
      res.status(401).json({ error: 'Login kræves' });
      return;
    }
  
   
    try {
      // 1) Hent dokumentet inkl. rowIndex
      const doc = await KeywordDefModel
  .findOne({ _id: keywordId, sheetId, userId: user._id })
  .lean();
      if (!doc) {
        res.status(404).json({ error: 'Keyword ikke fundet' });
        return;
      }
  
      // 2) Ekstra tjek af rowIndex
      const rowIndex = doc.rowIndex;
      if (typeof rowIndex !== 'number') {
        res.status(500).json({ error: 'Ingen rowIndex i DB-dokument' });
        return;
      }
  
      // 3) Slet rækken i Sheets
      try {
        const oauth = createOAuthClient();
        oauth.setCredentials({ refresh_token: user.refreshToken });
        await deleteKeywordRowInSheet(oauth, sheetId, rowIndex);
      } catch (err: any) {
        console.warn('Kunne ikke slette Keyword-række i Sheet:', err.message);
        
      }
  
      // 4) Slet dokumentet i DB
      await KeywordDefModel.deleteOne({ _id: keywordId });
      res.json({ message: 'Keyword slettet i både Sheet og DB' });
  
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    } 
  };
  


/**
 * ==============================================================================================
 * POST /api/keyword-defs/:sheetId/sync
 * ==============================================================================================
 */
export const syncKeywords: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user!;
  const { sheetId } = req.params;

  if (!user || !user.refreshToken) {
    res.status(401).json({ error: 'Login kræves' });
    return;
  }

  const oauth = createOAuthClient();
  oauth.setCredentials({ refresh_token: user.refreshToken });

  try {
    const parsed = await syncKeywordDefsFromSheet(
      oauth,
      sheetId,
      user._id.toString()
    );
    // parsed er array af ParsedKeyword – returnér antal
    res.json({ status: 'OK', updated: parsed.length });
    return;
  } catch (err: any) {
    res.status(500).json({ error: err.message });
    return;
  }
};
