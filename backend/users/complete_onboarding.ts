import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

// Marks the user's onboarding as completed.
export const completeOnboarding = api<void, void>(
  { auth: true, expose: true, method: "POST", path: "/users/complete-onboarding" },
  async () => {
    const auth = getAuthData()!;
    const now = new Date();
    
    await cardfixDB.exec`
      UPDATE users 
      SET "onboardingCompleted" = true, "onboardingCompletedAt" = ${now}, "updatedAt" = ${now}
      WHERE id = ${auth.userID}
    `;
  }
);
