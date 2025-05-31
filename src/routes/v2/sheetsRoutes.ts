// src/routes/v2/sheetsRoutes.ts
import express from 'express';
import * as ctrl from '../../controllers/sheetsController';

const sheetsV2Router = express.Router();

/**
 * @openapi
 * /api/sheets/v2:
 *   post:
 *     summary: Opret et nyt Google Sheet for en bruger (v2)
 *     tags: [Sheets v2]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SheetInput'
 *     responses:
 *       201:
 *         description: Sheet oprettet succesfuldt (v2)
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
sheetsV2Router.post('/', ctrl.createSheet);

/**
 * @openapi
 * /api/sheets/v2:
 *   get:
 *     summary: Hent alle sheets for den loggede bruger (v2)
 *     tags: [Sheets v2]
 *     responses:
 *       200:
 *         description: Liste af sheets (v2)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sheet'
 *     security:
 *       - bearerAuth: []
 */
sheetsV2Router.get('/', ctrl.getSheets);

/**
 * @openapi
 * /api/sheets/v2/{id}:
 *   get:
 *     summary: Hent et specifikt sheet (v2)
 *     tags: [Sheets v2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sheet data (v2)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sheet'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */
sheetsV2Router.get('/:id', ctrl.getSheetById);

/**
 * @openapi
 * /api/sheets/v2/{id}:
 *   put:
 *     summary: Opdater sheet navn (v2)
 *     tags: [Sheets v2]
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
 *         description: Sheet opdateret (v2)
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
sheetsV2Router.put('/:id', ctrl.updateSheetById);

/**
 * @openapi
 * /api/sheets/v2/{id}:
 *   delete:
 *     summary: Slet et sheet (v2)
 *     tags: [Sheets v2]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sheet slettet (v2)
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
sheetsV2Router.delete('/:id', ctrl.deleteSheetById);

export default sheetsV2Router;
