import express from 'express';
import * as ctrl from '../../controllers/sheetsController';

const sheetsV1Router = express.Router();

/**
 * @openapi
 * /api/sheets/v1:
 *   post:
 *     summary: Opret et nyt Google Sheet for en bruger (v1)
 *     tags: [Sheets v1]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SheetInput'
 *     responses:
 *       201:
 *         description: Sheet oprettet succesfuldt (v1)
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
sheetsV1Router.post('/', ctrl.createSheet);

/**
 * @openapi
 * /api/sheets/v1:
 *   get:
 *     summary: Hent alle sheets for den loggede bruger (v1)
 *     tags: [Sheets v1]
 *     responses:
 *       200:
 *         description: Liste af sheets (v1)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Sheet'
 *     security:
 *       - bearerAuth: []
 */
sheetsV1Router.get('/', ctrl.getSheets);

/**
 * @openapi
 * /api/sheets/v1/{id}:
 *   get:
 *     summary: Hent et specifikt sheet (v1)
 *     tags: [Sheets v1]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sheet data (v1)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Sheet'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *     security:
 *       - bearerAuth: []
 */
sheetsV1Router.get('/:id', ctrl.getSheetById);

/**
 * @openapi
 * /api/sheets/v1/{id}:
 *   put:
 *     summary: Opdater sheet navn (v1)
 *     tags: [Sheets v1]
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
 *         description: Sheet opdateret (v1)
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
sheetsV1Router.put('/:id', ctrl.updateSheetById);

/**
 * @openapi
 * /api/sheets/v1/{id}:
 *   delete:
 *     summary: Slet et sheet (v1)
 *     tags: [Sheets v1]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sheet slettet (v1)
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
sheetsV1Router.delete('/:id', ctrl.deleteSheetById);

export default sheetsV1Router;
