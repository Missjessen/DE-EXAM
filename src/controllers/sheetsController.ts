import { NextFunction, Response } from 'express';
import { Types } from 'mongoose';
import { SheetModel } from '../models/SheetModel';
import { createUserSheet } from '../services/googleSheetsService';
import { createOAuthClient } from '../services/googleAuthService';
import { AuthenticatedRequest } from '../interfaces/userReq';
import { google } from 'googleapis';

// ░▒▓██ get, post, put, delete (CRUD)██▓▒░

/**
 * ==============================================================================================
 * * POST /api/sheets
 * ==============================================================================================
 */
export const createSheet = async (
  req: AuthenticatedRequest,
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const name = req.body.name as string;
    if (!name) {
      res.status(400).json({ error: 'Navn på sheet mangler' });
      return;
    }
    const exists = await SheetModel.findOne({ userId: user._id, name });
    if (exists) {
      res.status(409).json({ error: 'Du har allerede et sheet med dette navn' });
      return;
    }
    const oauth = createOAuthClient();
    oauth.setCredentials({ refresh_token: user.refreshToken });
    const sheetId = await createUserSheet(oauth, name);
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`;
    const sheet = await SheetModel.create({
      userId: new Types.ObjectId(user._id),
      sheetId,
      name,
      sheetUrl
    });
    res.status(201).json(sheet);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ error: 'Sheet-navn allerede i brug' });
    } else {
      next(err);
    }
  }
};


/**
 * ==============================================================================================
 * GET /api/sheets
 * ==============================================================================================
 */
export const getSheets = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const docs = await SheetModel.find({ userId: user._id }).lean().exec();
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

/**
 * ==============================================================================================
 * GET /api/sheets/:sheetId
 * ==============================================================================================
 */
export const getSheetById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const id = req.params.id;
    const doc = await SheetModel.findOne({ _id: id, userId: user._id }).lean().exec();
    if (!doc) {
      res.status(404).json({ error: 'Sheet ikke fundet' });
      return;
    }
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

/**
 * ==============================================================================================
 * PUT /api/sheets/:sheetId
 * ==============================================================================================
 */
export const updateSheetById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const id = req.params.id;
    const newName = req.body.name as string;
    if (!newName) {
      res.status(400).json({ error: 'Nyt navn mangler' });
      return;
    }
    const updated = await SheetModel.findOneAndUpdate(
      { _id: id, userId: user._id },
      { name: newName },
      { new: true, lean: true }
    );
    if (!updated) {
      res.status(404).json({ error: 'Sheet ikke fundet' });
      return;
    }
    // Optional: rename in Google Drive
    try {
      const oauth2 = createOAuthClient();
      oauth2.setCredentials({ refresh_token: user.refreshToken });
      await google.drive({ version: 'v3', auth: oauth2 }).files.update({
        fileId: updated.sheetId,
        supportsAllDrives: true,
        requestBody: { name: newName }
      });
    } catch (driveErr: any) {
      console.warn('Drive rename fejlede:', driveErr.message);
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
};



/**
 * ==============================================================================================
 * DELETE /api/sheets/:sheetId
 * ==============================================================================================
 */
export const deleteSheetById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user!;
    const id = req.params.id;
    const doc = await SheetModel.findOne({ _id: id, userId: user._id });
    if (!doc) {
      res.status(404).json({ error: 'Sheet ikke fundet' });
      return;
    }
    // Optional: delete from Google Drive
    try {
      const oauth2 = createOAuthClient();
      oauth2.setCredentials({ refresh_token: user.refreshToken });
      await google.drive({ version: 'v3', auth: oauth2 }).files.delete({ fileId: doc.sheetId });
    } catch (driveErr: any) {
      console.warn('Drive delete fejlede:', driveErr.message);
    }
    await SheetModel.deleteOne({ _id: id });
    res.json({ message: 'Sheet slettet' });
  } catch (err) {
    next(err);
  }
};

