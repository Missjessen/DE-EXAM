// src/routes/v2/syncRoutes.ts
import { Router } from 'express';
import * as ctrl from '../../controllers/syncSheetController';

const syncV2Router = Router();

/**
 * @openapi
 * /api/sheets/v2/{sheetId}/sync-db-all:
 *   post:
 *     summary: Synkroniser kampagner, annoncer og keywords fra Sheet til MongoDB (v2)
 *     tags: [Sheets v2]
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
 *         description: Antal synkroniserede rækker (v2)
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
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
syncV2Router.post('/:sheetId/sync-db-all', ctrl.syncDbController);

/**
 * @openapi
 * /api/sheets/v2/{sheetId}/sync-ads:
 *   post:
 *     summary: Synkroniser Ads fra AllResources-tab til Google Ads API (v2)
 *     tags: [Sheets v2]
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
 *         description: Liste af statusbeskeder fra Ads API (v2)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statuses:
 *                   type: array
 *                   items:
 *                     type: string
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
syncV2Router.post('/:sheetId/sync-ads', ctrl.syncAdsController);

/**
 * @openapi
 * /api/sheets/v2/{sheetId}/sync-all-and-ads:
 *   post:
 *     summary: Synkroniser alle data til DB og send til Ads API i ét kald (v2)
 *     tags: [Sheets v2]
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
 *         description: Detaljeret synkroniseringsresultat (v2)
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
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
syncV2Router.post('/:sheetId/sync-all-and-ads', ctrl.syncAllAndAdsController);

export default syncV2Router;
