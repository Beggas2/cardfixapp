import { api, APIError } from "encore.dev/api";
import { LoginRequest, LoginResponse } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";
import { verifyPassword, generateToken } from "./utils";

// Authenticates a user with email and password.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/users/login" },
  async (req) => {
    // First, try to find the user
    const user = await cardfixDB.queryRow`
      SELECT * FROM users WHERE email = ${req.email}
    `;

    if (!user) {
      throw APIError.unauthenticated("invalid credentials");
    }

    // If user exists but has no password (anonymous user), reject
    if (!user.password) {
      throw APIError.unauthenticated("invalid credentials");
    }

    // Verify password
    const isValidPassword = await verifyPassword(req.password, user.password);
    if (!isValidPassword) {
      throw APIError.unauthenticated("invalid credentials");
    }

    // Generate token
    const token = generateToken({
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      isAnonymous: user.isAnonymous,
    });

    return {
      token,
      user: {
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
      },
    };
  }
);
