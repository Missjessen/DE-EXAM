// src/controllers/campaignDefsController.ts
import { RequestHandler } from 'express';
import { CampaignDefModel } from '../models/CampaignDefModel';
import { AuthenticatedRequest } from '../interfaces/userReq';
import { syncCampaignDefsFromSheet } from '../services/campaignDefsService';
import { createOAuthClient } from '../services/googleAuthService';
import { updateCampaignRowInSheet, deleteCampaignRowInSheet } from '../services/campaignDefsService';

/**
 * ======================== GET  /api/campaign-defs/:sheetId ========================
 */
export const getCampaignsForSheet: RequestHandler = async (req, res) => {
  const user = (req as AuthenticatedRequest).user;
  const { sheetId } = req.params;
  if (!user) {
    res.status(401).json({ error: 'Login kræves' });
    return;
  }

  try {
    const docs = await CampaignDefModel
      .find({ sheetId, userId: user._id })
      .lean()
      .exec();
    res.json(docs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } 
};

/**
 * ======================== PUT  /api/campaign-defs/:sheetId/:campaignId ========================
 */
export const updateCampaign: RequestHandler = async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const { sheetId, campaignId } = req.params;
    const updates = req.body;
  
    if (!user?.refreshToken) {
      res.status(401).json({ error: 'Login kræves' });
      return;
    }
  
    // 1) Opd. i Mongo og hent rowIndex
  
    let doc;
    try {
      doc = await CampaignDefModel.findOneAndUpdate(
        { _id: campaignId, sheetId, userId: user._id },
        updates,
        { new: true, lean: true }
      );
      if (!doc) {
        res.status(404).json({ error: 'Kampagne ikke fundet' });
        return;
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      return;
    } 
    
  
    // 2) Opdater i Google Sheet på netop den række
    try {
      const oauth = createOAuthClient();
      oauth.setCredentials({ refresh_token: user.refreshToken });
      await updateCampaignRowInSheet(
        oauth,
        sheetId,
        doc.rowIndex,      // bemærk: bruger rowIndex i stedet for campaignId
        {
          name:      updates.name,
          status:    updates.status,
          budget:    updates.budget,
          startDate: updates.startDate,
          endDate:   updates.endDate
        }
      );
    } catch (e: any) {
      console.warn('Kunne ikke opdatere Sheet-række:', e.message);
    }
  
    // 3) Returnér det opdaterede dokument
    res.json(doc);
    return;
  };
/**
 * ======================== DELETE  /api/campaign-defs/:sheetId/:campaignId ========================
 */
export const deleteCampaign: RequestHandler = async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const { sheetId, campaignId } = req.params;
  
    if (!user?.refreshToken) {
      res.status(401).json({ error: 'Login kræves' });
      return;
    }
  
    // 1) Hent rowIndex + slet dokument i Mongo
    let rowIndex: number;
    try {
      const doc = await CampaignDefModel.findOne({ _id: campaignId, sheetId, userId: user._id }).lean();
      if (!doc) {
        res.status(404).json({ error: 'Kampagne ikke fundet' });
        return;
      }
      rowIndex = doc.rowIndex;
      await CampaignDefModel.deleteOne({ _id: campaignId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      return;
    } 
  
  
    // 2) Slet rækken i Google Sheet
    try {
      const oauth = createOAuthClient();
      oauth.setCredentials({ refresh_token: user.refreshToken });
      await deleteCampaignRowInSheet(oauth, sheetId, rowIndex);
    } catch (e: any) {
      console.warn('Kunne ikke slette række i Sheet:', e.message);
    }
  
    // 3) Returnér succes
    res.json({ message: 'Kampagne slettet' });
    return;
  };
  
/**
 * ======================== POST /api/campaign-defs/:sheetId/sync-db ========================
 * ======================== Pull alle kampagner fra sheets og gemmer (overskriver) i DB ========================
 */
export const syncCampaignDefs: RequestHandler = async (req, res) => {
    const user = (req as AuthenticatedRequest).user;
    const { sheetId } = req.params;
  
    if (!user || !user.refreshToken) {
      res.status(401).json({ error: 'Login kræves' });
      return;             
    }
  
    // Opret OAuth-client
    const oauth = createOAuthClient();
    oauth.setCredentials({ refresh_token: user.refreshToken });
  
    try {
      const parsed = await syncCampaignDefsFromSheet(
        oauth,
        sheetId,
        user._id.toString()
      );
      res.json({ synced: parsed.length, data: parsed });
      return;           
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      return;         
    } 
    
  };