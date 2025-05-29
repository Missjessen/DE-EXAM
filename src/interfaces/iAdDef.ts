// src/interfaces/IAdDef.ts
import { Types } from 'mongoose';
export interface IAdDef {
    _id?:       Types.ObjectId;
    userId:     Types.ObjectId;
    sheetId:    string;        // Google Sheets ID
    adGroup:    string;        // Navn på Ad Group
    headline1:  string;
    headline2?: string;
    description:string;
    finalUrl:   string;
    path1?:     string;
    path2?:     string;
    rowIndex?:  number;        // til two-way sync
    createdAt?: Date;
  }
  