// src/routes/sheets.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as ctrl from '../controllers/syncSheetController';

// █████████████████████████████████████████████████
// █           Sync. ROUTES                        █
// █████████████████████████████████████████████████


const syncRouter = Router();
syncRouter.use(requireAuth);

/**
 * @openapi
 * /api/sheets/{sheetId}/sync-db-all:
 *   post:
 *     summary: Synkroniser kampagner, annoncer og keywords fra Sheet til MongoDB
 *     tags: [Sheets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sheetId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Antal synkroniserede rækker
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 campaigns:
 *                   type: integer
 *                   example: 5
 *                 ads:
 *                   type: integer
 *                   example: 10
 *                 keywords:
 *                   type: integer
 *                   example: 15
 */
syncRouter.post('/:sheetId/sync-db-all', ctrl.syncDbController);

/**
 * @openapi
 * /api/sheets/{sheetId}/sync-ads:
 *   post:
 *     summary: Synkroniser Ads fra AllResources-tab til Google Ads API
 *     tags: [Sheets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sheetId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste af statusbeskeder fra Ads API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuses:
 *                   type: array
 *                   items:
 *                     type: string
 */
syncRouter.post('/:sheetId/sync-ads', ctrl.syncAdsController);

/**
 * @openapi
 * /api/sheets/{sheetId}/sync-all-and-ads:
 *   post:
 *     summary: Synkroniser alle data til DB og send til Ads API i ét kald
 *     tags: [Sheets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sheetId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detaljeret synkroniseringsresultat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 campaignsSynced:
 *                   type: integer
 *                   example: 5
 *                 adsSynced:
 *                   type: integer
 *                   example: 10
 *                 keywordsSynced:
 *                   type: integer
 *                   example: 15
 *                 adsStatuses:
 *                   type: array
 *                   items:
 *                     type: string
 */
syncRouter.post('/:sheetId/sync-all-and-ads', ctrl.syncAllAndAdsController);

export default syncRouter;