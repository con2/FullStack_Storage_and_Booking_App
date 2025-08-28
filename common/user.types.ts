/**
 * Shared user-related types between frontend and backend.
 *
 * These types are derived from Supabase-generated types (via `supabase gen types typescript`)
 */

import { Database } from "./supabase.types";

/**
 * DTO for creating a new user.
 * Includes all insertable fields from `user_profiles` plus a required `password` field.
 */
export type CreateUserDto =
  Database["public"]["Tables"]["user_profiles"]["Insert"] & {
    password: string; // Password is required for creating a new user
  };

/**
 * DTO for updating an existing user.
 * Includes all updatable fields from `user_profiles` and requires the `id` of the user.
 */
export type UpdateUserDto =
  Database["public"]["Tables"]["user_profiles"]["Update"] & {
    id: string; // Ensure the ID is included for updates
  };

/**
 * Represents a full row from the `user_profiles` table.
 */
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

/**
 * Represents a full row from the `user_addresses` table.
 */
export type UserAddress = Database["public"]["Tables"]["user_addresses"]["Row"];
