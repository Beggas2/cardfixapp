import { api, APIError } from "encore.dev/api";
import { CreateUserRequest, User } from "./types";
import cardfixDB from "../external_dbs/cardfix_db_pnuf/db";
import { generateId, hashPassword } from "./utils";

// Creates a new user account.
export const create = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    // Check if user already exists
    const existingUser = await cardfixDB.queryRow`
      SELECT id FROM users WHERE email = ${req.email}
    `;

    if (existingUser) {
      throw APIError.alreadyExists("user with this email already exists");
    }

    const userId = generateId();
    const hashedPassword = req.password ? await hashPassword(req.password) : null;
    
    const now = new Date();
    
    await cardfixDB.exec`
      INSERT INTO users (
        id, email, password, name, "isAdmin", "isAnonymous", 
        plan, "onboardingCompleted", "createdAt", "updatedAt"
      ) VALUES (
        ${userId}, ${req.email}, ${hashedPassword}, ${req.name || null}, 
        false, ${req.isAnonymous || false}, 'FREE', false, ${now}, ${now}
      )
    `;

    return {
      id: userId,
      email: req.email,
      name: req.name,
      isAdmin: false,
      isAnonymous: req.isAnonymous || false,
      plan: "FREE",
      onboardingCompleted: false,
      createdAt: now,
      updatedAt: now,
    };
  }
);
