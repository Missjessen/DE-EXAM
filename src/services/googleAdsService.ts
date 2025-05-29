// services/googleAdsService.ts
import { GoogleAdsApi } from 'google-ads-api';
import { IUser } from '../interfaces/iUser';

const googleAdsClient = new GoogleAdsApi({
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  developer_token: process.env.GOOGLE_DEVELOPER_TOKEN!
});

/**
 * Returnerer en Google Ads API-klient for en specifik bruger
 * @param user - Bruger med refreshToken og googleAdsCustomerId
 * @returns En autoriseret kundeinstans fra GoogleAdsApi
 */
export function getAdsClient(user: IUser) {
  if (!user.refreshToken || !user.googleAdsCustomerId) {
    throw new Error("Bruger mangler Ads-forbindelse");
  }

  return googleAdsClient.Customer({
    customer_id: user.googleAdsCustomerId,
    login_customer_id: user.googleAdsCustomerId,
    refresh_token: user.refreshToken
  });
}

/**
 * Henter de første 10 kampagner for en bruger fra Google Ads
 * @param user - Bruger med Google Ads adgang
 * @returns En liste af kampagner (id, navn, status)
 */
export async function getCampaignsForUser(user: IUser) {
  const client = getAdsClient(user);

  const response = await client.query(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status
    FROM campaign
    LIMIT 10
  `);

  return response;
}






/*   export const getCustomer = (customerId: string, refreshToken: string) => {
    return client.Customer({
      customer_id: customerId,
      refresh_token: refreshToken,
    });
  }; */

// Henter kampagner fra Google Ads API
/* export async function fetchCampaigns(user: IUser) {
    try {
        const customer = await getAdsClient(user); // <-- Bemærk: await tilføjet her

        // Udfør Google Ads Query Language (GAQL) forespørgsel
        const response = await customer.query(`
            SELECT campaign.id, campaign.name, campaign.status
            FROM campaign
            LIMIT 10
        `);

        // Ekstraherer kampagner fra resultatet
        const campaigns = response.map((row: any) => row.campaign);
        console.log("✅ Kampagner hentet: ", campaigns);
        return campaigns;
    } catch (error) {
        console.error("Fejl under hentning af kampagner: ", error);
        throw error;
    }
} */




    
    
 