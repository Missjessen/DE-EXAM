// src/routes/keywordRoutes.ts
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as ctrl from '../controllers/keywordDefsController';

// █████████████████████████████████████████████████
// █           Keywords ROUTES (CRUD)              █
// █████████████████████████████████████████████████


const keywordsRouter = Router({ mergeParams: true });
keywordsRouter.use(requireAuth);
/**
 * @openapi
 * /api/keyword-defs/{sheetId}:
 *   get:
 *     summary: Hent alle keyword-definitioner for et specifikt sheet
 *     tags: [KeywordDefs]
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
 *         description: En liste af keyword-definitioner
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/KeywordDef'
 */
keywordsRouter.get('/:sheetId', ctrl.getKeywordsForSheet);

/**
 * @openapi
 * /api/keyword-defs/{sheetId}/{keywordId}:
 *   put:
 *     summary: Opdater en keyword-definition i både sheet og DB
 *     tags: [KeywordDefs]
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
 *         description: Det opdaterede keyword-definition-objekt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KeywordDef'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
keywordsRouter.put('/:sheetId/:keywordId', ctrl.updateKeyword);

/**
 * @openapi
 * /api/keyword-defs/{sheetId}/{keywordId}:
 *   delete:
 *     summary: Slet en keyword-definition fra både sheet og DB
 *     tags: [KeywordDefs]
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
 *         description: Bekræftelse på sletning
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Keyword slettet i både Sheet og DB
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
keywordsRouter.delete('/:sheetId/:keywordId', ctrl.deleteKeyword);

/**
 * @openapi
 * /api/keyword-defs/{sheetId}/sync:
 *   post:
 *     summary: Synkroniser keywords fra Google Sheet til MongoDB
 *     tags: [KeywordDefs]
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
 *         description: Antal opdaterede keywords
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
 */
keywordsRouter.post('/:sheetId/sync', ctrl.syncKeywords);

export default keywordsRouter;