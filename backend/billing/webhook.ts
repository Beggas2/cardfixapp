import { api } from "encore.dev/api";
import { WebhookRequest } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

// Handles Stripe webhook events.
export const webhook = api<WebhookRequest, void>(
  { expose: true, method: "POST", path: "/billing/webhook" },
  async (req) => {
    // In a real implementation, you would verify the webhook signature
    // and handle different event types from Stripe
    
    switch (req.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(req.data);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(req.data);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(req.data);
        break;
      default:
        console.log(`Unhandled webhook event: ${req.type}`);
    }
  }
);

async function handleCheckoutCompleted(data: any) {
  // Update user's plan after successful checkout
  const customerId = data.customer;
  const plan = data.metadata?.plan || 'PRO';
  
  await cardfixDB.exec`
    UPDATE billing 
    SET plan = ${plan}, status = 'ACTIVE', "updatedAt" = ${new Date()}
    WHERE "stripeCustomerId" = ${customerId}
  `;
  
  await cardfixDB.exec`
    UPDATE users 
    SET plan = ${plan}, "updatedAt" = ${new Date()}
    WHERE id = (
      SELECT "userId" FROM billing WHERE "stripeCustomerId" = ${customerId}
    )
  `;
}

async function handlePaymentSucceeded(data: any) {
  // Update billing period after successful payment
  const customerId = data.customer;
  const periodEnd = new Date(data.lines.data[0].period.end * 1000);
  
  await cardfixDB.exec`
    UPDATE billing 
    SET "currentPeriodEnd" = ${periodEnd}, "updatedAt" = ${new Date()}
    WHERE "stripeCustomerId" = ${customerId}
  `;
}

async function handleSubscriptionDeleted(data: any) {
  // Downgrade user to FREE plan when subscription is canceled
  const customerId = data.customer;
  
  await cardfixDB.exec`
    UPDATE billing 
    SET plan = 'FREE', status = 'CANCELED', "updatedAt" = ${new Date()}
    WHERE "stripeCustomerId" = ${customerId}
  `;
  
  await cardfixDB.exec`
    UPDATE users 
    SET plan = 'FREE', "updatedAt" = ${new Date()}
    WHERE id = (
      SELECT "userId" FROM billing WHERE "stripeCustomerId" = ${customerId}
    )
  `;
}
