export type BillingStatus = "ACTIVE" | "INACTIVE" | "CANCELED";
export type UserPlan = "FREE" | "PRO" | "PREMIUM";

export interface Billing {
  id: string;
  userId: string;
  stripeCustomerId?: string;
  plan: UserPlan;
  status: BillingStatus;
  currentPeriodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCheckoutRequest {
  plan: UserPlan;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutResponse {
  checkoutUrl: string;
}

export interface WebhookRequest {
  type: string;
  data: any;
}

export interface PlanLimits {
  flashcardsPerMonth: number;
  activeContests: number;
  aiRequestsPerDay: number;
  features: string[];
}

export interface GetLimitsResponse {
  limits: PlanLimits;
  usage: {
    flashcardsThisMonth: number;
    activeContests: number;
    aiRequestsToday: number;
  };
}
