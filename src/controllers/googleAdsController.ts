// controllers/googleAdsController.ts
import { Request, Response } from 'express';
import { iUserModel } from '../models/iUserModel';
import { createTestAccount } from '../services/googleAds/createTestAccount';





/**
 * ======================== Opretter en testkonto i Google Ads (sandbox-miljø) ========================
 * @route POST /api/ads/create-test-account
 */
export const createGoogleAdsTestAccount = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await createTestAccount();
      res.status(200).json({ message: "Testkonto oprettet", data: result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  export const setGoogleAdsId = async (req: Request, res: Response): Promise<void> => {
    const { userId, googleAdsCustomerId } = req.body;
  
    if (!googleAdsCustomerId || googleAdsCustomerId.length !== 10) {
      res.status(400).json({ error: "Ugyldigt Google Ads ID" });
      return;
    }
  
    try {
      
      const updatedUser = await iUserModel.findByIdAndUpdate(
        userId,
        { googleAdsCustomerId },
        { new: true }
      );
  
      if (!updatedUser) {
        res.status(404).json({ error: "Bruger ikke fundet" });
        return;
      }
  
      res.status(200).json({ message: 'Google Ads ID tilføjet', updatedUser });
    } catch (error) {
      res.status(500).json({ error: 'Fejl ved opdatering af Ads ID: ' + error });
    } 
  
  };
  

  export const getCustomerList = async (req: Request, res: Response): Promise<void> => {
    try {
      
      const customers = await iUserModel.find({}, 'email googleAdsCustomerId');
  
      if (!customers || customers.length === 0) {
        res.status(404).json({ error: "Ingen kunder fundet" });
        return;
      }
  
      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({ error: "Fejl ved hentning af kunder: " + error });
    } 
  };
  










