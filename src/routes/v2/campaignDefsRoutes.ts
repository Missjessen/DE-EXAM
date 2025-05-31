// src/routes/v2/campaignDefsRoutes.ts
import express from 'express';
import * as ctrl from '../../controllers/campaignDefsController';

const campaignV2Router = express.Router();

/**
 * @openapi
 * /api/campaign-defs/v2/{sheetId}:
 *   get:
 *     summary: Hent alle kampagnedefinitioner for et specifikt sheet (v2)
 *     tags: [CampaignDefs v2]
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
 *         description: En liste af kampagnedefinitioner (v2)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CampaignDef'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
campaignV2Router.get('/:sheetId', ctrl.getCampaignsForSheet);

/**
 * @openapi
 * /api/campaign-defs/v2/{sheetId}/{campaignId}:
 *   put:
 *     summary: Opdater en kampagnedefinition i både sheet og DB (v2)
 *     tags: [CampaignDefs v2]
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
 *         description: Det opdaterede kampagnedefinition-objekt (v2)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CampaignDef'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
campaignV2Router.put('/:sheetId/:campaignId', ctrl.updateCampaign);

/**
 * @openapi
 * /api/campaign-defs/v2/{sheetId}/{campaignId}:
 *   delete:
 *     summary: Slet en kampagnedefinition fra både sheet og DB (v2)
 *     tags: [CampaignDefs v2]
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
 *         description: Bekræftelse på sletning (v2)
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
campaignV2Router.delete('/:sheetId/:campaignId', ctrl.deleteCampaign);

/**
 * @openapi
 * /api/campaign-defs/v2/{sheetId}/sync-db:
 *   post:
 *     summary: Synkroniser kampagnedefinitioner fra Google Sheet til MongoDB (v2)
 *     tags: [CampaignDefs v2]
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
 *         description: Antal synkroniserede kampagner og data (v2)
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
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
campaignV2Router.post('/:sheetId/sync-db', ctrl.syncCampaignDefs);

export default campaignV2Router;
