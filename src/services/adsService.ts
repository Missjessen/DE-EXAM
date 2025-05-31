// src/services/adsService.ts
import type { RequestInit, Response as FetchResponse } from 'node-fetch';

const GOOGLE_ADS_BASE = 'https://googleads.googleapis.com/v14';
const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID;

/**
 * Hjælper til dynamisk at loade `node-fetch`, uden at TS eller ts-node prøver
 * at bruge `require()` på en ESM‐pakke. Returnerer default‐eksporten (fetch-funktionen).
 */
async function getFetch(): Promise<(url: string, init?: RequestInit) => Promise<FetchResponse>> {
  // Dynamisk import, så vi undgår ERR_REQUIRE_ESM i CI eller lokal dev
  const mod = await import('node-fetch');
  // ESM‐modulet eksporterer typisk default i `mod.default`. Hvis det ikke findes,
  // så prøver vi `mod` selv (tilfælde hvor `node-fetch` allerede er CommonJS).
  return (mod as any).default ?? mod;
}

/**
 * Mutate‐funktion til Google Ads API.
 * @param endpoint Delslutningen (f.eks. 'campaigns:mutate' eller 'adGroups:mutate' osv.)
 * @param operations En liste af “create”‐objekter, som sendes i body.operations[].create.
 */
async function mutate(endpoint: string, operations: any[]): Promise<any> {
  if (!operations.length) {
    return Promise.resolve([]);
  }

  // Hent fetch‐funktionen dynamisk
  const fetch = await getFetch();

  if (!CUSTOMER_ID) {
    throw new Error('Mangler miljøvariabel: GOOGLE_ADS_CUSTOMER_ID');
  }
  if (!process.env.GOOGLE_ADS_TOKEN) {
    throw new Error('Mangler miljøvariabel: GOOGLE_ADS_TOKEN');
  }

  const url = `${GOOGLE_ADS_BASE}/customers/${CUSTOMER_ID}/${endpoint}`;
  const body = { operations: operations.map(op => ({ create: op })) };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GOOGLE_ADS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Ads API error (${endpoint}): ${text}`);
  }

  return await res.json();
}

export const callAdsApiCampaignMutate  = (ops: any[]) => mutate('campaigns:mutate', ops);
export const callAdsApiAdGroupMutate   = (ops: any[]) => mutate('adGroups:mutate', ops);
export const callAdsApiAdMutate        = (ops: any[]) => mutate('adGroupAds:mutate', ops);
export const callAdsApiCriterionMutate = (ops: any[]) => mutate('adGroupCriteria:mutate', ops);
