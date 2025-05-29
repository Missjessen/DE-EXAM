// src/interfaces/ICampaign.ts
import { Types } from 'mongoose';
export interface ICampaign {
  _id?: Types.ObjectId;
  userId: Types.ObjectId;
  sheetId: string;
  name: string;
  status: 'ENABLED' | 'PAUSED';
  startDate: string;
  endDate: string;
  budget?: number;
  createdAt?: Date;
}