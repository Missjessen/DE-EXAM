// src/routes/adRoutes.ts
import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import * as ctrl       from '../controllers/adDefsController'

// █████████████████████████████████████████████████
// █           Ads ROUTES (CRUD)                   █
// █████████████████████████████████████████████████

const adRouter = Router()

// Beskyt alle endpoints med JWT
adRouter.use(requireAuth)
/**
 * @openapi
 * /api/ad-defs/{sheetId}:
 *   get:
 *     summary: Hent alle annoncer for et specifikt sheet
 *     tags: [AdDefs]
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
 *         description: En liste af annoncer
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AdDef'
 */
adRouter.get('/:sheetId', ctrl.getAdsForSheet)

/**
 * @openapi
 * /api/ad-defs/{sheetId}/{adId}:
 *   put:
 *     summary: Opdater en annonce i både sheet og DB
 *     tags: [AdDefs]
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
 *         description: Den opdaterede annonce
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdDef'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
adRouter.put('/:sheetId/:adId', ctrl.updateAd)

/**
 * @openapi
 * /api/ad-defs/{sheetId}/{adId}:
 *   delete:
 *     summary: Slet en annonce fra både sheet og DB
 *     tags: [AdDefs]
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
 *         description: Bekræftelse på sletning
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
adRouter.delete('/:sheetId/:adId', ctrl.deleteAd)

/**
 * @openapi
 * /api/ad-defs/{sheetId}/sync-db:
 *   post:
 *     summary: Synkroniser annoncer fra Google Sheet til MongoDB
 *     tags: [AdDefs]
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
 *         description: Antal synkroniserede annoncer
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 synced:
 *                   type: integer
 *                   example: 8
 */
adRouter.post('/:sheetId/sync-db', ctrl.syncAds)

export default adRouter
