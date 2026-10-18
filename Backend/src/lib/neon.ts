import { createClient } from "@neondatabase/neon-js";
import dotenv from "dotenv";

dotenv.config();

// In Node.js / Express backend, environment variables are accessed via process.env
export const NEON_DATA_API_URL =
  process.env.NEON_DATA_API_URL ||
  process.env.VITE_NEON_DATA_API_URL ||
  "https://ep-dry-flower-b4hr1d3x.apirest.c-6.us-east-2.aws.neon.tech/neondb/rest/v1";

/**
 * Creates a Neon Data API client with an optional JWT token or token retriever.
 * Neon validates this JWT against the JWKS URL configured in your Neon Console.
 *
 * @param tokenOrGetter Optional JWT token string or async function returning a token (e.g. Clerk's getToken())
 */
export function createNeonClient(
  tokenOrGetter?: string | (() => Promise<string | null> | string | null)
) {
  const getToken = async (): Promise<string | null> => {
    if (typeof tokenOrGetter === "function") {
      try {
        return (await tokenOrGetter()) || null;
      } catch {
        return null;
      }
    }
    if (typeof tokenOrGetter === "string" && tokenOrGetter.length > 0) {
      return tokenOrGetter;
    }
    // Fallback to environment token if provided
    return process.env.NEON_AUTH_TOKEN || null;
  };

  return createClient({
    dataApi: {
      url: NEON_DATA_API_URL,
      getToken,
    },
  });
}

// Default export client instance for general use
export const neon = createNeonClient();

/**
 * Helper to fetch users from Neon Data API
 */
export async function getNeonUsers(authToken?: string) {
  try {
    const client = authToken ? createNeonClient(authToken) : neon;
    const { data, error } = await client
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (err: unknown) {
    const error = err as Error;
    return { data: null, error: { message: error.message } };
  }
}

/**
 * Helper to insert or update a user via Neon Data API
 */
export async function upsertNeonUser(
  user: {
    id: string;
    email: string;
    name: string;
    first_name?: string;
    last_name?: string;
    image_url?: string;
    plan?: string;
  },
  authToken?: string
) {
  try {
    const client = authToken ? createNeonClient(authToken) : neon;
    const { data, error } = await client
      .from("users")
      .upsert(user, { onConflict: "id" })
      .select();

    return { data, error };
  } catch (err: unknown) {
    const error = err as Error;
    return { data: null, error: { message: error.message } };
  }
}