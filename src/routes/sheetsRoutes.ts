import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import * as ctrl from '../controllers/sheetsController';



// █████████████████████████████████████████████████
// █           Sheets ROUTES (CRUD)                █
// █████████████████████████████████████████████████


const sheetsRouter = express.Router();

sheetsRouter.use(requireAuth);

/**
 * @openapi
 * /api/sheets:
 *   post:
 *     summary: Opret et nyt Google Sheet for en bruger
 *     tags: [Sheets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SheetInput'
 *     responses:
 *       201:
 *         description: Sheet oprettet succesfuldt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sheet'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */
sheetsRouter.post('/', ctrl.createSheet);

/**
 * @openapi
 * /api/sheets:
 *   get:
 *     summary: Hent alle sheets for den loggede bruger
 *     tags: [Sheets]
 *     responses:
 *       200:
 *         description: Liste af sheets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sheet'
 *     security:
 *       - bearerAuth: []
 */
sheetsRouter.get('/', ctrl.getSheets);

/**
 * @openapi
 * /api/sheets/{id}:
 *   get:
 *     summary: Hent et specifikt sheet
 *     tags: [Sheets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sheet data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sheet'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */
sheetsRouter.get('/:id', ctrl.getSheetById);

/**
 * @openapi
 * /api/sheets/{id}:
 *   put:
 *     summary: Opdater sheet navn
 *     tags: [Sheets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SheetInput'
 *     responses:
 *       200:
 *         description: Sheet opdateret
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sheet'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */
sheetsRouter.put('/:id', ctrl.updateSheetById);

/**
 * @openapi
 * /api/sheets/{id}:
 *   delete:
 *     summary: Slet et sheet
 *     tags: [Sheets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sheet slettet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Sheet slettet'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */
sheetsRouter.delete('/:id', ctrl.deleteSheetById);

export default sheetsRouter;
