import { api } from "encore.dev/api";
import { AnonymousLoginResponse } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";
import { generateId, generateToken } from "./utils";

// Creates an anonymous user session.
export const loginAnonymous = api<void, AnonymousLoginResponse>(
  { expose: true, method: "POST", path: "/users/login-anonymous" },
  async () => {
    const userId = generateId();
    const email = `anon_${userId.substring(0, 8)}@cardfix.com`;
    
    const now = new Date();
    
    await cardfixDB.exec`
      INSERT INTO users (
        id, email, "isAdmin", "isAnonymous", plan, 
        "onboardingCompleted", "createdAt", "updatedAt"
      ) VALUES (
        ${userId}, ${email}, false, true, 'FREE', false, ${now}, ${now}
      )
    `;

    const token = generateToken({
      sub: userId,
      email,
      isAdmin: false,
      isAnonymous: true,
    });

    return {
      token,
      user: {
        id: userId,
        email,
        name: null,
        isAdmin: false,
        isAnonymous: true,
        plan: "FREE",
        onboardingCompleted: false,
        createdAt: now,
        updatedAt: now,
      },
    };
  }
);
