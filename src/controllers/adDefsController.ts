// src/controllers/adDefsController.ts
import { RequestHandler } from 'express';
import { AdDefModel } from '../models/adDefModel';
import { AuthenticatedRequest } from '../interfaces/userReq';
import {
  syncAdDefsFromSheet,
  updateAdRowInSheet,
  deleteAdRowInSheet
} from '../services/adDefsService';
import { createOAuthClient } from '../services/googleAuthService';


/**
 * ======================== GET /api/ad-defs/:sheetId ========================
 */
export const getAdsForSheet: RequestHandler = async (req, res): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;
  const { sheetId } = req.params;

  const docs = await AdDefModel
    .find({ sheetId, userId: user._id })
    .lean()
    .exec();

  res.json(docs);
  return;
};

/**
 *  ======================== PUT /api/ad-defs/:sheetId/:adId========================
 */
export const updateAd: RequestHandler = async (req, res): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;
  const { sheetId, adId } = req.params;
  const updates = req.body;

  // 1) Opd. DB
  const doc = await AdDefModel.findOneAndUpdate(
    { _id: adId, sheetId, userId: user._id },
    updates,
    { new: true, lean: true }
  );

  if (!doc) {
    res.status(404).json({ error: 'Annonce ikke fundet' });
    return;
  }

  // 2) Opd. Sheet
  try {
    const oauth = createOAuthClient();
    oauth.setCredentials({ refresh_token: user.refreshToken });
    await updateAdRowInSheet(oauth, sheetId, adId, updates);
  } catch (e: any) {
    console.warn('Kunne ikke opdatere annonce-række i Sheet:', e.message);
  }

  // 3) Retur opd. dokument
  res.json(doc);
  return;
};

/**
 * ======================== DELETE /api/ad-defs/:sheetId/:adId ========================
 */
export const deleteAd: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user!;
  const { sheetId, adId } = req.params;

  // 1) Hent annoncen fra DB
  const doc = await AdDefModel
    .findOne({ _id: adId, sheetId, userId: user._id })
    .lean()
    .exec();

  if (!doc) {
    res.status(404).json({ error: 'Annonce ikke fundet' });
    return;
  }

  
  if (typeof doc.rowIndex !== 'number') {
    res.status(500).json({ error: 'Kan ikke finde række-index for annoncen' });
    return;
  }

 
  try {
    const oauth = createOAuthClient();
    oauth.setCredentials({ refresh_token: user.refreshToken });
    // Her er doc.rowIndex garanteret at være number
    await deleteAdRowInSheet(oauth, sheetId, doc.rowIndex);
  } catch (err: any) {
    console.warn('Kunne ikke slette annonce-række i Sheet:', err.message);
    
  }

  // 4) Slet annoncen i DB
  await AdDefModel.deleteOne({ _id: adId, sheetId, userId: user._id });

  // 5) Returnér bekræftelse
  res.json({ message: 'Annonce slettet' });
  return;
};
/**
 * ======================== POST /api/ad-defs/:sheetId/sync-db ========================
 */
export const syncAds: RequestHandler = async (req, res): Promise<void> => {
  const user = (req as AuthenticatedRequest).user!;
  const { sheetId } = req.params;

  // 1) Auth
  if (!user.refreshToken) {
    res.status(401).json({ error: 'Login kræves' });
    return;
  }

  // 2) Sync
  const oauth = createOAuthClient();
  oauth.setCredentials({ refresh_token: user.refreshToken });

  const parsed = await syncAdDefsFromSheet(oauth, sheetId, user._id.toString());

  // 3) Retur antal
  res.json({ synced: parsed.length });
  return;
};
