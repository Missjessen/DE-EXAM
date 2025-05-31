// cruise-nights-api/src/config/swagger.config.ts

import { SwaggerOptions } from '@missjessen/mdb-rest-api-core';

const localUrl = process.env.API_BASE_URL || 'http://localhost:4000';
const prodUrl  = 'https://mdb-rest.onrender.com';

export const swaggerConfig: SwaggerOptions = {
  baseUrl: localUrl,
  devToken: process.env.DEV_TOKEN,

  extraDefinition: {
    info: {
      title: 'MDB REST API',
      version: '1.0.0',
      description:
        '📄 Dokumentation for Sheets, Ads, Keywords, Campaigns, Sync osv.\n\n' +
        '🔒 Alle ruter kræver JWT Bearer-token under “Authorize”.',
    },
    servers: [
      { url: localUrl, description: '🛠️ Lokal udvikling' },
      { url: prodUrl,  description: '🚀 Produktion' },
    ],

    
    components: {
      schemas: {
        // ─── Sheet (allerede på plads) ─────────────────────────────────
        SheetInput: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Google Ads kampagne' },
          },
          required: ['name'],
        },
        Sheet: {
          type: 'object',
          properties: {
            _id:    { type: 'string', example: '6643fae92735a8d799ca0e2a' },
            name:   { type: 'string', example: 'Google Ads kampagne' },
            sheetUrl: { type: 'string', example: 'https://docs.google.com/spreadsheets/d/xyz123' },
            userId: { type: 'string', example: '663abc12345def0000000000' },
          },
        },

        // ─── CampaignDef (allerede på plads) ─────────────────────────────
        CampaignDef: {
          type: 'object',
          properties: {
            _id:       { type: 'string' },
            userId:    { type: 'string' },
            sheetId:   { type: 'string' },
            name:      { type: 'string' },
            status:    { type: 'string', enum: ['ENABLED', 'PAUSED'] },
            startDate: { type: 'string' },
            endDate:   { type: 'string' },
            budget:    { type: 'number' },
            rowIndex:  { type: 'number' },
            createdAt: { type: 'string' },
          },
        },

        // ─── KeywordDef (tilføj denne) ───────────────────────────────────
        KeywordDef: {
          type: 'object',
          properties: {
            _id:       { type: 'string' },
            userId:    { type: 'string' },
            sheetId:   { type: 'string' },
            adGroup:   { type: 'string' },
            keyword:   { type: 'string' },
            matchType: { type: 'string', enum: ['BROAD','PHRASE','EXACT'] },
            cpc:       { type: 'number' },
            rowIndex:  { type: 'number' },
            createdAt: { type: 'string' },
          },
        },

        // ─── AdDef (tilføj denne) ────────────────────────────────────────
        AdDef: {
          type: 'object',
          properties: {
            _id:       { type: 'string' },
            userId:    { type: 'string' },
            sheetId:   { type: 'string' },
            adGroup:   { type: 'string' },
            headline1: { type: 'string' },
            headline2: { type: 'string' },
            description: { type: 'string' },
            finalUrl:  { type: 'string' },
            path1:     { type: 'string' },
            path2:     { type: 'string' },
            rowIndex:  { type: 'number' },
            createdAt: { type: 'string' },
          },
        },

        // ─── ErrorResponse (tilføj denne) ────────────────────────────────
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Noget gik galt' },
          },
        },
      },
    },
  },

  extraApis: [
    './src/routes/v1/**/*.ts',
    './src/routes/v2/**/*.ts',
    './src/controllers/**/*.ts',
  ],
};
