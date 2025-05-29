// src/models/CampaignDefModel.ts
import { Schema, model, Document } from 'mongoose';
import { ICampaignDef } from '../interfaces/iCampaignDef';

export interface CampaignDefDoc extends Document, Omit<ICampaignDef,'_id'> {}

const CampaignDefSchema = new Schema<CampaignDefDoc>({
  userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sheetId:    { type: String, required: true, index: true },
  name:       { type: String, required: true },
  status:     { type: String, enum: ['ENABLED','PAUSED'], required: true, default: 'ENABLED' },
  startDate:  { type: String, required: true },
  endDate:    { type: String, required: true },
  budget:     { type: Number },
  rowIndex:   { type: Number, required: true },   
  createdAt:  { type: Date, default: () => new Date() }
}, {
  collection: 'campaignDefs',
  versionKey: false
});


export const CampaignDefModel = model<CampaignDefDoc>('CampaignDef', CampaignDefSchema);
