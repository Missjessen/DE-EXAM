// src/models/AdDefModel.ts
import { Schema, model, Document } from 'mongoose';
import { IAdDef } from '../interfaces/iAdDef';

export interface AdDefDoc extends Omit<IAdDef,'_id'>, Document {}


const AdDefSchema = new Schema<AdDefDoc>(
  {
    userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sheetId:     { type: String, required: true, index: true },
    adGroup:     { type: String, required: true },
    headline1:   { type: String, required: true },
    headline2:   { type: String },
    description: { type: String, required: true },
    finalUrl:    { type: String, required: true },
    path1:       { type: String },
    path2:       { type: String },
    rowIndex:    { type: Number },
    createdAt:   { type: Date, default: () => new Date() }
  },
  {
    collection: 'adDefs',
    versionKey: false
  }
);

// Undgå dubletter 
AdDefSchema.index(
  { sheetId:1, adGroup:1, headline1:1, description:1 },
  { unique: true }
);

export const AdDefModel = model<AdDefDoc>('AdDef', AdDefSchema);
