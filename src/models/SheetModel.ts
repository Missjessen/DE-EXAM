// src/models/SheetModel.ts
import { Schema, model } from "mongoose";
import { ISheet } from '../interfaces/iSheet';


export interface SheetDocument extends Document, Omit<ISheet,'_id'> {}

const SheetSchema = new Schema<SheetDocument>({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sheetId:   { type: String, required: true, unique: true },
  name:      { type: String, required: true },
  sheetUrl:  { type: String, required: true },
  createdAt: { type: Date,   default: () => new Date() },
  lastSynced:{ type: Date }
}, {
  collection: 'sheets',
  versionKey: false
});
SheetSchema.index({ userId: 1, name: 1 }, { unique: true });

export const SheetModel = model<SheetDocument>('Sheet', SheetSchema);
