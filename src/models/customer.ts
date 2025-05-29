import { Schema, model } from "mongoose";
import { GoogleCustomer } from "../interfaces/googlecustomer";


const googleCustomerSchema = new Schema<GoogleCustomer>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    google_ads_id: { type: String, required: true }
})

export const googleCustomerModel = model<GoogleCustomer>('GoogleCustomer', googleCustomerSchema);
