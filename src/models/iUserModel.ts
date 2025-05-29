import { Schema, model } from "mongoose";
import { IUser } from '../interfaces/iUser'

const iUserSchema = new Schema<IUser>({
  email:        { type: String, required: true, unique: true },
  googleId:     { type: String, required: true, unique: true },
  accessToken:  { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiryDate:   { type: Date,   required: true },

  name:    { type: String }, 
  picture: { type: String },

  googleAdsCustomerId: { type: String },  
  sheetId:             { type: String }   
});

export const iUserModel = model<IUser>('iUser', iUserSchema);




  /* name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    //password: { type: String },  // Adgangskode er valgfri
    google_ads_id: { type: String },
    access_token: { type: String },
    refresh_token: { type: String },
    sheets_id: { type: String },
    google_id: { type: String }, // Gemmer unikt Google ID

    createdAt: { type: Date },  // Til at gemme, hvornår brugeren blev oprettet
    updatedAt: { type: Date }     // Til at registrere, hvornår brugerens data sidst blev opdateret */