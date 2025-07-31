import type { MergeDeep } from "type-fest";
import type { Database as Base } from "@common/supabase.types";
export type { Json } from "@common/supabase.types";

/* ── Concrete shapes for our translations ─────────────── */
type ItemTranslations = {
  en: { item_name: string; item_type: string; item_description: string };
  fi: { item_name: string; item_type: string; item_description: string };
};

type TagTranslations = {
  en: { name: string };
  fi: { name: string };
};
// Helps to override the `Json | null` type in the database schema
/* ── Add the shape of translations here ──────────────────────────── */
export type Database = MergeDeep<
  Base,
  {
    public: {
      Tables: {
        storage_items: {
          Row: { translations: ItemTranslations | null };
          Insert: { translations?: ItemTranslations | null };
          Update: { translations?: ItemTranslations | null };
        };
        tags: {
          Row: { translations: TagTranslations | null };
          Insert: { translations?: TagTranslations | null };
          Update: { translations?: TagTranslations | null };
        };
        storage_item_tags: {
          Row: {
            translations: TagTranslations | null;
          };
          Insert: {
            translations?: TagTranslations | null;
          };
          Update: {
            translations?: TagTranslations | null;
          };
        };
        user_profiles: {
          Row: {
            preferences: Record<string, string> | null;
            saved_lists: string[] | null;
          };
          Insert: {
            preferences?: Record<string, string> | null;
            saved_lists?: string[] | null;
          };
          Update: {
            preferences?: Record<string, string> | null;
            saved_lists?: string[] | null;
          };
        };
      };
    };
  }
>;

/* ── Helpers that mirror supabase-js generics but use *our* Database ── */
/**
 * Get the **row** shape of any public table in one line.
 *
 * ```ts
 * // Example: shape of a single row in `storage_items`
 * type StorageItem = DBTables<"storage_items">;
 *
 * // You now have full IntelliSense for every column:
 * const foo: StorageItem = {
 *   id: "123",
 *   item_type: "chair",
 *   // …
 * };
 * ```
 */
export type DBTables<
  N extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][N]["Row"];

/**
 * Get the **insert payload** type for any public table.
 * Only required columns remain mandatory; columns with defaults become optional.
 *
 * ```ts
 * // Example: payload for inserting into `user_organization_roles`
 * type CreateUserRoleDto = DBTablesInsert<"user_organization_roles">;
 *
 * // Only 3 FK columns are required—`id`, `created_at`, etc. are optional
 * const payload: CreateUserRoleDto = {
 *   user_id: "abc",
 *   organization_id: "org1",
 *   role_id: "role1",
 * };
 * ```
 */
export type DBTablesInsert<
  N extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][N]["Insert"];

/**
 * Get the **partial update** type for any public table.
 * All properties are optional so you can patch just a subset of columns.
 *
 * ```ts
 * // Example: updating a storage item's translations
 * type StorageItemPatch = DBTablesUpdate<"storage_items">;
 *
 * const patch: StorageItemPatch = {
 *   id: "123",
 *   translations: { en: { item_name: "Chair", item_type: "Furniture", item_description: "—" } }
 * };
 * ```
 */
export type DBTablesUpdate<
  N extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][N]["Update"];