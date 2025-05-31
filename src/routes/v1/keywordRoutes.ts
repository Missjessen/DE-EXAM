// src/routes/v1/keywordRoutes.ts
import { Router } from 'express';
import * as ctrl from '../../controllers/keywordDefsController';

// ────────────────────────────────────────────────────────────────────────────────
// ─── Keyword Definitions ROUTES (V1) ────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────────────────────

const keywordsV1Router = Router({ mergeParams: true });

/**
 * @openapi
 * /api/keyword-defs/v1/{sheetId}:
 *   get:
 *     summary: Hent alle keyword-definitioner for et specifikt sheet (v1)
 *     tags: [KeywordDefs v1]
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
 *         description: En liste af keyword-definitioner (v1)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/KeywordDef'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
keywordsV1Router.get('/:sheetId', ctrl.getKeywordsForSheet);

/**
 * @openapi
 * /api/keyword-defs/v1/{sheetId}/{keywordId}:
 *   put:
 *     summary: Opdater en keyword-definition i både sheet og DB (v1)
 *     tags: [KeywordDefs v1]
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
 *         description: Det opdaterede keyword-definition-objekt (v1)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KeywordDef'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
keywordsV1Router.put('/:sheetId/:keywordId', ctrl.updateKeyword);

/**
 * @openapi
 * /api/keyword-defs/v1/{sheetId}/{keywordId}:
 *   delete:
 *     summary: Slet en keyword-definition fra både sheet og DB (v1)
 *     tags: [KeywordDefs v1]
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
 *         description: Bekræftelse på sletning (v1)
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
keywordsV1Router.delete('/:sheetId/:keywordId', ctrl.deleteKeyword);

/**
 * @openapi
 * /api/keyword-defs/v1/{sheetId}/sync:
 *   post:
 *     summary: Synkroniser keywords fra Google Sheet til MongoDB (v1)
 *     tags: [KeywordDefs v1]
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
 *         description: Antal opdaterede keywords (v1)
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
keywordsV1Router.post('/:sheetId/sync', ctrl.syncKeywords);

export default keywordsV1Router;
