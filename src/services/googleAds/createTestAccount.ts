import axios from "axios";
import dotenvFlow from "dotenv-flow";

dotenvFlow.config();

export async function createTestAccount() {
    try {
        const accessToken = process.env.GOOGLE_ACCESS_TOKEN;
        const mccId = process.env.GOOGLE_MCC_ID;

        if (!accessToken || !mccId) {
            throw new Error("Manglende adgangstoken eller MCC ID");
        }

        const url = `https://googleads.googleapis.com/v13/customers/${mccId}/customerClients:mutate`;

        // Request body til at oprette en testkonto
        const requestBody = {
            operations: [
                {
                    create: {
                        descriptiveName: "API Test Account",
                        currencyCode: "DKK",
                        timeZone: "Europe/Copenhagen",
                        testAccount: true  // VIGTIGT: Markér som testkonto
                    },
                },
            ],
            partialFailure: false,
            validateOnly: false
        };

        // HTTP POST-request til Google Ads API
        const response = await axios.post(url, requestBody, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "developer-token": process.env.GOOGLE_DEVELOPER_TOKEN!,
            },
        });

        console.log("✅ Testkonto oprettet:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("❌ Fejl ved oprettelse af testkonto:", error.response?.data || error.message);
        throw new Error(error.response?.data || error.message);
    }
}
