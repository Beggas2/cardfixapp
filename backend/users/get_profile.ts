import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { User } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";

// Gets the current user's profile.
export const getProfile = api<void, User>(
  { auth: true, expose: true, method: "GET", path: "/users/me" },
  async () => {
    const auth = getAuthData()!;
    
    const user = await cardfixDB.queryRow`
      SELECT * FROM users WHERE id = ${auth.userID}
    `;

    if (!user) {
      throw APIError.notFound("user not found");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      isAnonymous: user.isAnonymous,
      plan: user.plan,
      onboardingCompleted: user.onboardingCompleted,
      onboardingCompletedAt: user.onboardingCompletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
);
