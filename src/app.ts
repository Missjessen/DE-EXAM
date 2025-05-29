import { NextFunction, Request, Response } from "express";
import cookieParser from 'cookie-parser';
import express, { Application } from "express";
import dotenvFlow from "dotenv-flow";
import cors from "cors";  
import router from "./routes";
import { setupSwagger } from "./util/documentationSwag";
import authRoutes from './routes/authRoutes';
import sheetsRoutes from './routes/sheetsRoutes';
import adRoutes from './routes/adRoutes';
import keywordsRouter from './routes/keywordRoutes';
import campaignDefsRoutes from './routes/campaignDefsRoutes';
import syncRouter from './routes/syncRoutes';
import helmet from 'helmet';
import { generalLimiter } from './middleware/rateLimiter';

import dotenv from 'dotenv';

dotenv.config();


dotenvFlow.config();

// ======================== APP INITIALIZATION ========================
const app: Application = express();


// ======================== CORS SETUP ========================


const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

// 2) Byg server-origin (hvor Swagger UI kører)
const port = process.env.PORT || 4000;
const serverOrigin = `http://localhost:${port}`;


if (!allowedOrigins.includes(serverOrigin)) {
  allowedOrigins.push(serverOrigin);
}

// 4) Sæt CORS-middleware op
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error(`CORS‐fejl: Origin ${origin} ikke tilladt`));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','auth-token']
}));




// ======================== MIDDLEWARE SETUP ========================
app.use(generalLimiter); 

app.use(express.json());         
//app.use(express.urlencoded({ extended: true })); 

// ======================== SERVER START ========================

    // Handle preflight requests
    app.options("*", cors());

    app.use(
      helmet({
        contentSecurityPolicy: {
          useDefaults: false,   // drop Helmet’s default “default-src 'self'; script-src 'self'” helt
          directives: {
            // 1) Helt grundlæggende egen app + egen API-host
            "default-src": ["'self'"],
    
            // 2) Stylings: tillad inline-styles (til f.eks. Tailwind) + Google Fonts CSS
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    
            // 3) Fonts: Google Fonts -host + data: (til evt. base64)
            "font-src":  ["'self'", "https://fonts.gstatic.com", "data:"],
    
            // 4) Scripts: egen app + evt. cdn’er
            "script-src": ["'self'",
              "https://apis.google.com",        // ny til gapi/auth2, picker osv. 
              "https://accounts.google.com"     // ny login-popup
            ],
    
            // 5) Connect: din frontends og backends origin (hvis du bruger fetch/WS)
            "connect-src": [
              "'self'",
              ...allowedOrigins
            ],
    
            // 6) Billeder o.l.: egen host + data:
            "img-src": ["'self'", "data:"],
    
            // hvis du har iframes, frames, etc. tilføj dem her…
          }
        }
      })
    )
    

    // Route setup
    app.use(cookieParser()); 
    app.use("/api", router); 
    app.use('/auth', authRoutes);
  
    app.use('/api/sheets', sheetsRoutes);
    //app.use('/api/deploy', deployRoutes);

    app.use('/api/campaign-defs', campaignDefsRoutes);
    app.use('/api/ad-defs', adRoutes);
    app.use('/api/keyword-defs', keywordsRouter);

    app.use('/api/sheets', syncRouter);
  
   

    // Swagger documentation
    setupSwagger(app);



    // 404-håndtering
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route ikke fundet' });
});



// Global error-handler (JSON)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API] Unhandled error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

  
    export default app;
