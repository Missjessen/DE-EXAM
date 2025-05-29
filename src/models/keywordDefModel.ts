// src/models/KeywordDefModel.ts
import { Schema, model, Document } from 'mongoose';
import { IKeywordDef } from '../interfaces/iKeywordDef';

export interface KeywordDefDoc extends Omit<IKeywordDef,'_id'>, Document {}

const KeywordDefSchema = new Schema<KeywordDefDoc>(
  {
    userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sheetId:   { type: String, required: true, index: true },
    adGroup:   { type: String, required: true },
    keyword:   { type: String, required: true },
    matchType: { type: String, enum: ['BROAD','PHRASE','EXACT'], required: true },
    cpc:       { type: Number },
    rowIndex:  { type: Number },  // valgfrit
    createdAt: { type: Date, default: () => new Date() }
  },
  {
    collection: 'keywordDefs',
    versionKey: false
  }
);

// Undgå dubletter 
KeywordDefSchema.index({ sheetId: 1, adGroup: 1, keyword: 1 }, { unique: true });

export const KeywordDefModel = model<KeywordDefDoc>('KeywordDef', KeywordDefSchema);
