// src/app.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import dotenvFlow from 'dotenv-flow';
import dotenv from 'dotenv';

import { generalLimiter } from './middleware/rateLimiter';


import {

  swaggerSetup,
  SwaggerOptions
} from '@missjessen/mdb-rest-api-core';

import { authMiddleware, versionRouter } from '@missjessen/mdb-rest-api-core';

// V1‐routers
import sheetsV1Router from './routes/v1/sheetsRoutes'
import campaignDefsV1Router from './routes/v1/campaignDefsRoutes'
import adDefsV1Router from './routes/v1/adRoutes'
import keywordDefsV1Router from './routes/v1/keywordRoutes'
import syncV1Router from './routes/v1/syncRoutes'

// V2‐routers (eksempelvis identiske nu, men kan afvige senere)
import sheetsV2Router from './routes/v2/sheetsRoutes'
import campaignDefsV2Router from './routes/v2/campaignDefsRoutes'
import adDefsV2Router from './routes/v2/adRoutes'
import keywordDefsV2Router from './routes/v2/keywordRoutes'
import syncV2Router from './routes/v2/syncRoutes'

// Load env
dotenv.config();
dotenvFlow.config();

const app: Express = express();
const port = process.env.PORT || 4000;
const serverOrigin = `http://localhost:${port}`;

// --- CORS Setup ---
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

if (!allowedOrigins.includes(serverOrigin)) {
  allowedOrigins.push(serverOrigin);
}

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error(`CORS-fejl: Origin ${origin} ikke tilladt`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','auth-token','X-Tenant-ID']
}));

// --- Security / JSON / Rate Limiter ---
app.use(generalLimiter);
app.use(express.json());
app.options('*', cors());
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      "default-src": ["'self'"],
      "style-src":   ["'self'","'unsafe-inline'","https://fonts.googleapis.com"],
      "font-src":    ["'self'","https://fonts.gstatic.com","data:"],
      "script-src":  ["'self'","https://apis.google.com","https://accounts.google.com"],
      "connect-src": ["'self'", ...allowedOrigins],
      "img-src":     ["'self'","data:"]
    }
  }
}));
app.use(cookieParser());

app.use('/auth', authRoutes);

// ─── Versioneret “Sheets” ──────────────────────────────────────────────────────
//
// Mount point for “Sheets‐API” under /api/sheets
// Vi beskytter altid med authMiddleware() → JWT + tenantId
app.use(
  '/api/sheets',
  authMiddleware(),
  versionRouter(
    {
      '1': sheetsV1Router,
      '2': sheetsV2Router,
    },
    { defaultVersion: '1' }
  )
)



// ─── Versioneret “Campaign‐Definitions” ───────────────────────────────────────
// Mount under /api/campaign-defs
app.use(
  '/api/campaign-defs',
  authMiddleware(),
  versionRouter(
    {
      '1': campaignDefsV1Router,
      '2': campaignDefsV2Router,
    },
    { defaultVersion: '1' }
  )
)


// ─── Versioneret “Ad‐Definitions” ─────────────────────────────────────────────
// Mount under /api/ad-defs
app.use(
  '/api/ad-defs',
  authMiddleware(),
  versionRouter(
    {
      '1': adDefsV1Router,
      '2': adDefsV2Router,
    },
    { defaultVersion: '1' }
  )
)


// ─── Versioneret “Keyword‐Definitions” ────────────────────────────────────────
// Mount under /api/keyword-defs
app.use(
  '/api/keyword-defs',
  authMiddleware(),
  versionRouter(
    {
      '1': keywordDefsV1Router,
      '2': keywordDefsV2Router,
    },
    { defaultVersion: '1' }
  )
)
// ─── Versioneret “Sync” ──────────────────────────────────────────────────────
app.use(
       '/api/sync',
       authMiddleware(),
       versionRouter(
         { '1': syncV1Router, '2': syncV2Router },
         { defaultVersion: '1' }
       )
     )

// --- Swagger UI (under /docs) ---
const swaggerOpts: SwaggerOptions = {
  baseUrl: process.env.API_BASE_URL || serverOrigin,
  devToken: process.env.DEV_TOKEN,
  extraDefinition: {
    info: {
      title: 'MDB REST API',
      version: '1.0.0',
      description: '📄 Dokumentation for Sheets, Ads, Keywords, Campaigns, Sync osv.'
    },
    servers: [
      { url: serverOrigin,               description: '🛠️ Lokal' },
      { url: 'https://mdb-rest.onrender.com', description: '🚀 Production' }
    ]
  },
  extraApis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts']
};

swaggerSetup(app, swaggerOpts);

// --- 404 handler ---
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route ikke fundet' });
});

// --- Global error handler ---
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API] Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export default app;

