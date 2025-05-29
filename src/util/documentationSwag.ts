// src/util/swaggerConfig.ts
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { Application } from 'express';

export function setupSwagger(app: Application) {
  const localUrl = process.env.API_BASE_URL || 'http://localhost:4000';
  const productionUrl = 'https://mdb-rest.onrender.com';

  const swaggerDefinition = {
    openapi: '3.0.1',
    info: {
      title: 'MDB REST API',
      version: '1.0.0',
      description:
        '📄 Dokumentation for Sheets-, Campaigns-, Keywords- og Ads-endpoints.\n\n🔒 Alle ruter kræver JWT Bearer-token under "Authorize".',
    },
    servers: [
      { url: localUrl, description: '🛠 Lokal udviklingsserver' },
      { url: productionUrl, description: '🚀 Produktion (Render deploy)' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        SheetInput: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Google Ads kampagne',
            },
          },
          required: ['name'],
        },
        Sheet: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6643fae92735a8d799ca0e2a' },
            name: { type: 'string', example: 'Google Ads kampagne' },
            sheetUrl: { type: 'string', example: 'https://docs.google.com/spreadsheets/d/xyz123' },
            userId: { type: 'string', example: '663abc12345def0000000000' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Sheet-navn allerede i brug',
            },
          },
        },
        CampaignDef: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            sheetId: { type: 'string' },
            name: { type: 'string' },
            status: { type: 'string', enum: ['ENABLED', 'PAUSED'] },
            startDate: { type: 'string' },
            endDate: { type: 'string' },
            budget: { type: 'number' },
            rowIndex: { type: 'number' },
            createdAt: { type: 'string' }
          }
        },
        KeywordDef: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            sheetId: { type: 'string' },
            adGroup: { type: 'string' },
            keyword: { type: 'string' },
            matchType: { type: 'string', enum: ['BROAD','PHRASE','EXACT'] },
            cpc: { type: 'number' },
            rowIndex: { type: 'number' },
            createdAt: { type: 'string' },
          }
        },
        AdDef: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            sheetId: { type: 'string' },
            adGroup: { type: 'string' },
            headline1: { type: 'string' },
            headline2: { type: 'string' },
            description: { type: 'string' },
            finalUrl: { type: 'string' },
            path1: { type: 'string' },
            path2: { type: 'string' },
            rowIndex: { type: 'number' },
            createdAt: { type: 'string' },
          }
        },
      },
    },
    security: [{ bearerAuth: [] }],
  };

  const options = {
    definition: swaggerDefinition,
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
  };

  const swaggerSpec = swaggerJsdoc(options);

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
