import fetch from 'node-fetch';


const GOOGLE_ADS_BASE = 'https://googleads.googleapis.com/v14';
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID;


/**
 * Mutate function for Google Ads API
 * @param endpoint The endpoint to call (e.g., 'campaigns:mutate')
 * @param operations The operations to perform
 */
async function mutate(endpoint: string, operations: any[]) {
  if (!operations.length) return;
  const url = `${GOOGLE_ADS_BASE}/customers/${CUSTOMER_ID}/${endpoint}`;
  const body = { operations: operations.map(op => ({ create: op })) };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GOOGLE_ADS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Ads API error: ${text}`);
  }
  return await res.json();
}

export const callAdsApiCampaignMutate     = (ops:any[]) => mutate('campaigns:mutate', ops);
export const callAdsApiAdGroupMutate      = (ops:any[]) => mutate('adGroups:mutate', ops);
export const callAdsApiAdMutate           = (ops:any[]) => mutate('adGroupAds:mutate', ops);
export const callAdsApiCriterionMutate    = (ops:any[]) => mutate('adGroupCriteria:mutate', ops);
