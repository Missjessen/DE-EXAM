// src/interfaces/ISheet.ts
import { Types } from 'mongoose';

export interface ISheet {
  _id:       Types.ObjectId;
  userId:    Types.ObjectId;
  sheetId:   string;        
  name:      string;       
  sheetUrl:  string;        // https://docs.google.com/…
  createdAt: Date;
  lastSynced?: Date;
}
