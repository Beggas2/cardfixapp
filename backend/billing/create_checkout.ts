import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { CreateCheckoutRequest, CreateCheckoutResponse } from "./types";
import { secret } from "encore.dev/config";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

const stripeSecretKey = secret("StripeSecretKey");

// Creates a Stripe checkout session for plan upgrade.
export const createCheckout = api<CreateCheckoutRequest, CreateCheckoutResponse>(
  { auth: true, expose: true, method: "POST", path: "/billing/checkout" },
  async (req) => {
    const auth = getAuthData()!;
    
    // Get or create Stripe customer
    let billing = await cardfixDB.queryRow`
      SELECT * FROM billing WHERE "userId" = ${auth.userID}
    `;

    if (!billing) {
      // Create billing record
      const now = new Date();
      await cardfixDB.exec`
        INSERT INTO billing (id, "userId", plan, status, "createdAt", "updatedAt")
        VALUES (${generateId()}, ${auth.userID}, 'FREE', 'ACTIVE', ${now}, ${now})
      `;
    }

    // In a real implementation, you would create a Stripe checkout session here
    // For now, we'll return a mock URL
    const checkoutUrl = `https://checkout.stripe.com/pay/mock_${req.plan}_${auth.userID}`;

    return { checkoutUrl };
  }
);

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
