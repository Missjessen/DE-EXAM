import { NextFunction, Response, RequestHandler} from 'express';
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
export const createSheet: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
  next
) => {
  try {
    const user     = req.user!         // kræver, at requireAuth har sat req.user
    const tenantId = req.tenantId!     // kræver, at requireAuth har sat req.tenantId
    const name     = req.body.name as string

    if (!name) {
      res.status(400).json({ error: 'Navn på sheet mangler' })
      return
    }

    // Tjek om sheet med samme navn allerede findes for denne tenant + bruger
    const exists = await SheetModel.findOne({
      tenantId,
      userId: user._id,
      name
    })
    if (exists) {
      res
        .status(409)
        .json({ error: 'Du har allerede et sheet med dette navn' })
      return
    }

   
    const oauth = createOAuthClient()
    oauth.setCredentials({ refresh_token: user.refreshToken! })
    const sheetId  = await createUserSheet(oauth, name)
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`

    const sheet = await SheetModel.create({
      tenantId,
      userId:    new Types.ObjectId(user._id),
      sheetId,
      name,
      sheetUrl
    })

    res.status(201).json(sheet)
  } catch (err: any) {
    if (err.code === 11000) {
      res
        .status(409)
        .json({
          error:
            'Sheet-navn allerede i brug for denne tenant og bruger'
        })
    } else {
      next(err)
    }
  }
}



/**
 * ==============================================================================================
 * GET /api/sheets
 * ==============================================================================================
 */
export const getSheets: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
  next
) => {
  try {
    const user     = req.user!
    const tenantId = req.tenantId!

    // Hent kun dem, der matcher både tenantId + userId
    const docs = await SheetModel.find({
      tenantId,
      userId: user._id
    })
      .lean()
      .exec()

    res.json(docs)
  } catch (err) {
    next(err)
  }
}


/**
 * ==============================================================================================
 * GET /api/sheets/:sheetId
 * ==============================================================================================
 */
export const getSheetById: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
  next
) => {
  try {
    const user     = req.user!
    const tenantId = req.tenantId!
    const id       = req.params.id

    const doc = await SheetModel.findOne({
      _id: id,
      tenantId,
      userId: user._id
    })
      .lean()
      .exec()

    if (!doc) {
      res.status(404).json({ error: 'Sheet ikke fundet' })
      return
    }
    res.json(doc)
  } catch (err) {
    next(err)
  }
}


/**
 * ==============================================================================================
 * PUT /api/sheets/:sheetId
 * ==============================================================================================
 */
export const updateSheetById: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
  next
) => {
  try {
    const user      = req.user!
    const tenantId  = req.tenantId!
    const id        = req.params.id
    const newName   = req.body.name as string

    if (!newName) {
      res.status(400).json({ error: 'Nyt navn mangler' })
      return
    }

    const updated = await SheetModel.findOneAndUpdate(
      { _id: id, tenantId, userId: user._id },
      { name: newName },
      { new: true, lean: true }
    )
    if (!updated) {
      res.status(404).json({ error: 'Sheet ikke fundet' })
      return
    }

    
    try {
      const oauth2 = createOAuthClient()
      oauth2.setCredentials({ refresh_token: user.refreshToken! })
      await google.drive({ version: 'v3', auth: oauth2 }).files.update({
        fileId: updated.sheetId,
        supportsAllDrives: true,
        requestBody: { name: newName }
      })
    } catch (driveErr: any) {
      console.warn('Drive rename fejlede:', driveErr.message)
    }

    res.json(updated)
  } catch (err) {
    next(err)
  }
}


/**
 * ==============================================================================================
 * DELETE /api/sheets/:sheetId
 * ==============================================================================================
 */
export const deleteSheetById: RequestHandler = async (
  req: AuthenticatedRequest,
  res,
  next
) => {
  try {
    const user     = req.user!
    const tenantId = req.tenantId!
    const id       = req.params.id

    const doc = await SheetModel.findOne({
      _id: id,
      tenantId,
      userId: user._id
    })
    if (!doc) {
      res.status(404).json({ error: 'Sheet ikke fundet' })
      return
    }

    // Optional: delete i Google Drive …
    try {
      const oauth2 = createOAuthClient()
      oauth2.setCredentials({ refresh_token: user.refreshToken! })
      await google.drive({ version: 'v3', auth: oauth2 }).files.delete({
        fileId: doc.sheetId
      })
    } catch (driveErr: any) {
      console.warn('Drive delete fejlede:', driveErr.message)
    }

    await SheetModel.deleteOne({
      _id: id,
      tenantId,
      userId: user._id
    })
    res.json({ message: 'Sheet slettet' })
  } catch (err) {
    next(err)
  }
}