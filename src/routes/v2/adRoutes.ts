// src/routes/v2/adRoutes.ts
import { Router } from 'express';
import * as ctrl from '../../controllers/adDefsController';

const adV2Router = Router();

/**
 * @openapi
 * /api/ad-defs/v2/{sheetId}:
 *   get:
 *     summary: Hent alle annoncer for et specifikt sheet (v2)
 *     tags: [AdDefs v2]
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
 *         description: En liste af annoncer (v2)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdDef'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
adV2Router.get('/:sheetId', ctrl.getAdsForSheet);

/**
 * @openapi
 * /api/ad-defs/v2/{sheetId}/{adId}:
 *   put:
 *     summary: Opdater en annonce i både sheet og DB (v2)
 *     tags: [AdDefs v2]
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
 *         description: Den opdaterede annonce (v2)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdDef'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
adV2Router.put('/:sheetId/:adId', ctrl.updateAd);

/**
 * @openapi
 * /api/ad-defs/v2/{sheetId}/{adId}:
 *   delete:
 *     summary: Slet en annonce fra både sheet og DB (v2)
 *     tags: [AdDefs v2]
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
 *         description: Bekræftelse på sletning (v2)
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
adV2Router.delete('/:sheetId/:adId', ctrl.deleteAd);

/**
 * @openapi
 * /api/ad-defs/v2/{sheetId}/sync-db:
 *   post:
 *     summary: Synkroniser annoncer fra Google Sheet til MongoDB (v2)
 *     tags: [AdDefs v2]
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
 *         description: Antal synkroniserede annoncer (v2)
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
adV2Router.post('/:sheetId/sync-db', ctrl.syncAds);

export default adV2Router;
