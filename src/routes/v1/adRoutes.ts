// src/routes/v1/adRoutes.ts
import { Router } from 'express';
import * as ctrl from '../../controllers/adDefsController';

const adV1Router = Router();

// ────────────────────────────────────────────────────────────────────────────────
// ─── Ad Definitions ROUTES (V1) ────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * /api/ad-defs/v1/{sheetId}:
 *   get:
 *     summary: Hent alle annoncer for et specifikt sheet (v1)
 *     tags: [AdDefs v1]
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
 *         description: En liste af annoncer (v1)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdDef'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
adV1Router.get('/:sheetId', ctrl.getAdsForSheet);

/**
 * @openapi
 * /api/ad-defs/v1/{sheetId}/{adId}:
 *   put:
 *     summary: Opdater en annonce i både sheet og DB (v1)
 *     tags: [AdDefs v1]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sheetId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: adId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdDef'
 *     responses:
 *       200:
 *         description: Den opdaterede annonce (v1)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdDef'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
adV1Router.put('/:sheetId/:adId', ctrl.updateAd);

/**
 * @openapi
 * /api/ad-defs/v1/{sheetId}/{adId}:
 *   delete:
 *     summary: Slet en annonce fra både sheet og DB (v1)
 *     tags: [AdDefs v1]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sheetId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: adId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Bekræftelse på sletning (v1)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Annonce slettet
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
adV1Router.delete('/:sheetId/:adId', ctrl.deleteAd);

/**
 * @openapi
 * /api/ad-defs/v1/{sheetId}/sync-db:
 *   post:
 *     summary: Synkroniser annoncer fra Google Sheet til MongoDB (v1)
 *     tags: [AdDefs v1]
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
 *         description: Antal synkroniserede annoncer (v1)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 synced:
 *                   type: integer
 *                   example: 8
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
adV1Router.post('/:sheetId/sync-db', ctrl.syncAds);

export default adV1Router;
