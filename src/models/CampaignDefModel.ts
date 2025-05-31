// src/models/CampaignDefModel.ts
import { Schema, model, Document } from 'mongoose'
import { ICampaignDef } from '../interfaces/iCampaignDef'

// 1) Vi opretter en “Document‐type” der arver fra både Document og resten af ICampaignDef (minus "_id").
export interface CampaignDefDoc extends Document, Omit<ICampaignDef, '_id'> {}

// 2) Her definerer vi schema‐felterne – præcis de samme felter, du skrev, bare flyttet sådan, at Mongoose “ser” dem rigtigt:
const CampaignDefSchema = new Schema<CampaignDefDoc>(
  {
    tenantId:   { type: String, required: true, index: true },
    userId:     { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sheetId:    { type: String, required: true, index: true },
    name:       { type: String, required: true },
    status:     { type: String, enum: ['ENABLED', 'PAUSED'], required: true, default: 'ENABLED' },
    startDate:  { type: String, required: true },
    endDate:    { type: String, required: true },
    budget:     { type: Number },                     // beholdt uændret, som du havde det
    rowIndex:   { type: Number, required: true },
    createdAt:  { type: Date, default: () => new Date() }
  },
  {
    collection: 'campaignDefs',
    versionKey: false
  }
)



// 4) Eksportér modellen:
export const CampaignDefModel = model<CampaignDefDoc>('CampaignDef', CampaignDefSchema)
