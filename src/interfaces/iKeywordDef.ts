// src/interfaces/IKeywordDef.ts
// src/interfaces/IKeywordDef.ts
import { Types } from 'mongoose';

export interface IKeywordDef {
        _id?: Types.ObjectId;
        userId: Types.ObjectId;
        sheetId: string;      // Google Sheets ID
        adGroup: string;      // Ad-group navn
        keyword: string;
        matchType: 'BROAD' | 'PHRASE' | 'EXACT';
        cpc?: number;
        rowIndex?: number;    //  two-way sync
        createdAt?: Date;
      }
  