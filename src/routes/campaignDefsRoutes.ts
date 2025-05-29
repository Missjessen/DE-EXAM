// src/routes/campaignDefsRoutes.ts
import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as ctrl from '../controllers/campaignDefsController';

// █████████████████████████████████████████████████
// █           Campaign ROUTES (CRUD)              █
// █████████████████████████████████████████████████


const campaignRouter = express.Router();

// alle ruter er beskyttet
campaignRouter.use(requireAuth);
/**
 * @openapi
 * /api/campaign-defs/{sheetId}:
 *   get:
 *     summary: Hent alle kampagnedefinitioner for et specifikt sheet
 *     tags: [CampaignDefs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sheetId
 *         required: true
 *         description: Google Sheet ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: En liste af kampagnedefinitioner
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CampaignDef'
 */
campaignRouter.get('/:sheetId', ctrl.getCampaignsForSheet);

/**
 * @openapi
 * /api/campaign-defs/{sheetId}/{campaignId}:
 *   put:
 *     summary: Opdater en kampagnedefinition i både sheet og DB
 *     tags: [CampaignDefs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sheetId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CampaignDef'
 *     responses:
 *       200:
 *         description: Det opdaterede kampagnedefinition-objekt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CampaignDef'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
campaignRouter.put('/:sheetId/:campaignId', ctrl.updateCampaign);

/**
 * @openapi
 * /api/campaign-defs/{sheetId}/{campaignId}:
 *   delete:
 *     summary: Slet en kampagnedefinition fra både sheet og DB
 *     tags: [CampaignDefs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sheetId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: campaignId
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
 *                   example: Kampagne slettet
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
campaignRouter.delete('/:sheetId/:campaignId', ctrl.deleteCampaign);

/**
 * @openapi
 * /api/campaign-defs/{sheetId}/sync-db:
 *   post:
 *     summary: Synkroniser kampagnedefinitioner fra Google Sheet til MongoDB
 *     tags: [CampaignDefs]
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
 *         description: Antal synkroniserede kampagner og data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 synced:
 *                   type: integer
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CampaignDef'
 */
campaignRouter.post('/:sheetId/sync-db', ctrl.syncCampaignDefs);

export default campaignRouter;
