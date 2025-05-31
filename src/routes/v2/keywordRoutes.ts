// src/routes/v2/keywordRoutes.ts
import { Router } from 'express';
import * as ctrl from '../../controllers/keywordDefsController';

const keywordsV2Router = Router({ mergeParams: true });

/**
 * @openapi
 * /api/keyword-defs/v2/{sheetId}:
 *   get:
 *     summary: Hent alle keyword-definitioner for et specifikt sheet (v2)
 *     tags: [KeywordDefs v2]
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
 *         description: En liste af keyword-definitioner (v2)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/KeywordDef'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
keywordsV2Router.get('/:sheetId', ctrl.getKeywordsForSheet);

/**
 * @openapi
 * /api/keyword-defs/v2/{sheetId}/{keywordId}:
 *   put:
 *     summary: Opdater en keyword-definition i både sheet og DB (v2)
 *     tags: [KeywordDefs v2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sheetId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: keywordId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/KeywordDef'
 *     responses:
 *       200:
 *         description: Det opdaterede keyword-definition-objekt (v2)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KeywordDef'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
keywordsV2Router.put('/:sheetId/:keywordId', ctrl.updateKeyword);

/**
 * @openapi
 * /api/keyword-defs/v2/{sheetId}/{keywordId}:
 *   delete:
 *     summary: Slet en keyword-definition fra både sheet og DB (v2)
 *     tags: [KeywordDefs v2]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sheetId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: keywordId
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
 *                   example: 'Keyword slettet i både Sheet og DB'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
keywordsV2Router.delete('/:sheetId/:keywordId', ctrl.deleteKeyword);

/**
 * @openapi
 * /api/keyword-defs/v2/{sheetId}/sync:
 *   post:
 *     summary: Synkroniser keywords fra Google Sheet til MongoDB (v2)
 *     tags: [KeywordDefs v2]
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
 *         description: Antal opdaterede keywords (v2)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 updated:
 *                   type: integer
 *                   example: 12
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
keywordsV2Router.post('/:sheetId/sync', ctrl.syncKeywords);

export default keywordsV2Router;
