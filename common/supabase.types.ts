export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      booking_items: {
        Row: {
          booking_id: string
          created_at: string | null
          end_date: string
          id: string
          item_id: string
          location_id: string
          provider_organization_id: string
          quantity: number
          start_date: string
          status: Database["public"]["Enums"]["booking_status"]
          total_days: number
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          end_date: string
          id?: string
          item_id: string
          location_id: string
          provider_organization_id: string
          quantity?: number
          start_date: string
          status: Database["public"]["Enums"]["booking_status"]
          total_days: number
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          item_id?: string
          location_id?: string
          provider_organization_id?: string
          quantity?: number
          start_date?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "storage_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_location_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "booking_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_ownership_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "booking_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_manage_storage_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_with_user_info"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_provider_organization_id_fkey"
            columns: ["provider_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_number: string
          created_at: string | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_number: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_number?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          delivered_at: string | null
          id: string
          idempotency_key: string
          message: string | null
          metadata: Json | null
          read_at: string | null
          severity: Database["public"]["Enums"]["notification_severity"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string | null
        }
        Insert: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          delivered_at?: string | null
          id?: string
          idempotency_key?: string
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          severity?: Database["public"]["Enums"]["notification_severity"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          delivered_at?: string | null
          id?: string
          idempotency_key?: string
          message?: string | null
          metadata?: Json | null
          read_at?: string | null
          severity?: Database["public"]["Enums"]["notification_severity"]
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_with_user_info"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_user_ban_status"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_locations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          storage_location_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          storage_location_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          storage_location_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erm_organization_locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erm_organization_locations_storage_location_id_fkey"
            columns: ["storage_location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          logo_picture_url: string | null
          name: string
          slug: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          logo_picture_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          logo_picture_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      pippi: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          code: string
          created_at: string | null
          description: string
          discount_type: string
          discount_value: number
          expires_at: string
          id: string
          is_active: boolean | null
          max_discount: number | null
          min_order_amount: number | null
          owner_organization_id: string | null
          starts_at: string
          times_used: number | null
          usage_limit: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description: string
          discount_type: string
          discount_value: number
          expires_at: string
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_amount?: number | null
          owner_organization_id?: string | null
          starts_at: string
          times_used?: number | null
          usage_limit?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string
          discount_type?: string
          discount_value?: number
          expires_at?: string
          id?: string
          is_active?: boolean | null
          max_discount?: number | null
          min_order_amount?: number | null
          owner_organization_id?: string | null
          starts_at?: string
          times_used?: number | null
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_owner_organization_id_fkey"
            columns: ["owner_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string | null
          id: string
          is_verified: boolean | null
          item_id: string
          rating: number
          review_text: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          item_id: string
          rating: number
          review_text?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          item_id?: string
          rating?: number
          review_text?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "storage_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_location_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_ownership_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "reviews_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_manage_storage_items"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["roles_type"]
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["roles_type"]
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["roles_type"]
        }
        Relationships: []
      }
      storage_analytics: {
        Row: {
          created_at: string | null
          date: string
          id: string
          location_id: string
          occupancy_rate: number | null
          total_bookings: number | null
          total_revenue: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          location_id: string
          occupancy_rate?: number | null
          total_bookings?: number | null
          total_revenue?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          location_id?: string
          occupancy_rate?: number | null
          total_bookings?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_analytics_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_compartments: {
        Row: {
          created_at: string | null
          id: string
          translations: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          translations?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          translations?: Json | null
        }
        Relationships: []
      }
      storage_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number
          id: string
          image_type: string
          image_url: string
          is_active: boolean | null
          location_id: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order: number
          id?: string
          image_type: string
          image_url: string
          is_active?: boolean | null
          location_id: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number
          id?: string
          image_type?: string
          image_url?: string
          is_active?: boolean | null
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_images_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_item_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          display_order: number
          id: string
          image_type: string
          image_url: string
          is_active: boolean | null
          item_id: string
          storage_path: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          display_order: number
          id?: string
          image_type: string
          image_url: string
          is_active?: boolean | null
          item_id: string
          storage_path: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          display_order?: number
          id?: string
          image_type?: string
          image_url?: string
          is_active?: boolean | null
          item_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_item_images_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "storage_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_item_images_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_location_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "storage_item_images_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_ownership_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "storage_item_images_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_manage_storage_items"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_item_tags: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          tag_id: string
          translations: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          tag_id: string
          translations?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          tag_id?: string
          translations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "storage_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_location_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "storage_item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_item_ownership_summary"
            referencedColumns: ["storage_item_id"]
          },
          {
            foreignKeyName: "storage_item_tags_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "view_manage_storage_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_item_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "view_tag_popularity"
            referencedColumns: ["tag_id"]
          },
        ]
      }
      storage_items: {
        Row: {
          available_quantity: number | null
          average_rating: number | null
          compartment_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_deleted: boolean | null
          location_id: string
          org_id: string
          quantity: number
          translations: Json | null
        }
        Insert: {
          available_quantity?: number | null
          average_rating?: number | null
          compartment_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          location_id: string
          org_id: string
          quantity: number
          translations?: Json | null
        }
        Update: {
          available_quantity?: number | null
          average_rating?: number | null
          compartment_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_deleted?: boolean | null
          location_id?: string
          org_id?: string
          quantity?: number
          translations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_items_compartment_id_fkey"
            columns: ["compartment_id"]
            isOneToOne: false
            referencedRelation: "storage_compartments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "storage_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_locations: {
        Row: {
          address: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          name: string
        }
        Insert: {
          address: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name: string
        }
        Update: {
          address?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          name?: string
        }
        Relationships: []
      }
      storage_working_hours: {
        Row: {
          close_time: string
          created_at: string | null
          day: string
          id: string
          is_active: boolean | null
          location_id: string
          open_time: string
        }
        Insert: {
          close_time: string
          created_at?: string | null
          day: string
          id?: string
          is_active?: boolean | null
          location_id: string
          open_time: string
        }
        Update: {
          close_time?: string
          created_at?: string | null
          day?: string
          id?: string
          is_active?: boolean | null
          location_id?: string
          open_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "storage_working_hours_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          translations: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          translations?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          translations?: Json | null
        }
        Relationships: []
      }
      test_features: {
        Row: {
          created_at: string | null
          description: string | null
          feature_name: string
          id: string
          is_enabled: boolean | null
          test_data: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feature_name: string
          id?: string
          is_enabled?: boolean | null
          test_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feature_name?: string
          id?: string
          is_enabled?: boolean | null
          test_data?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address_type: string
          city: string
          country: string
          created_at: string | null
          id: string
          is_default: boolean | null
          postal_code: string
          street_address: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address_type: string
          city: string
          country: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          postal_code: string
          street_address: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address_type?: string
          city?: string
          country?: string
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          postal_code?: string
          street_address?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_ban_history: {
        Row: {
          action: string
          affected_assignments: Json | null
          ban_reason: string | null
          ban_type: string
          banned_at: string | null
          banned_by: string
          created_at: string | null
          id: string
          is_permanent: boolean | null
          notes: string | null
          organization_id: string | null
          role_assignment_id: string | null
          unbanned_at: string | null
          user_id: string
        }
        Insert: {
          action: string
          affected_assignments?: Json | null
          ban_reason?: string | null
          ban_type: string
          banned_at?: string | null
          banned_by: string
          created_at?: string | null
          id?: string
          is_permanent?: boolean | null
          notes?: string | null
          organization_id?: string | null
          role_assignment_id?: string | null
          unbanned_at?: string | null
          user_id: string
        }
        Update: {
          action?: string
          affected_assignments?: Json | null
          ban_reason?: string | null
          ban_type?: string
          banned_at?: string | null
          banned_by?: string
          created_at?: string | null
          id?: string
          is_permanent?: boolean | null
          notes?: string | null
          organization_id?: string | null
          role_assignment_id?: string | null
          unbanned_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_ban_history_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ban_history_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "view_bookings_with_user_info"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_ban_history_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "view_user_ban_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ban_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ban_history_role_assignment_id_fkey"
            columns: ["role_assignment_id"]
            isOneToOne: false
            referencedRelation: "user_organization_roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ban_history_role_assignment_id_fkey"
            columns: ["role_assignment_id"]
            isOneToOne: false
            referencedRelation: "view_user_roles_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ban_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_ban_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_bookings_with_user_info"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_ban_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_user_ban_status"
            referencedColumns: ["id"]
          },
        ]
      }
      user_organization_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          role_id: string
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          role_id: string
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          role_id?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "erm_user_organization_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erm_user_organization_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          profile_picture_url: string | null
          role: string | null
          visible_name: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          profile_picture_url?: string | null
          role?: string | null
          visible_name?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          profile_picture_url?: string | null
          role?: string | null
          visible_name?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          profile_id: string
          role: Database["public"]["Enums"]["role_type"]
        }
        Insert: {
          created_at?: string | null
          profile_id: string
          role: Database["public"]["Enums"]["role_type"]
        }
        Update: {
          created_at?: string | null
          profile_id?: string
          role?: Database["public"]["Enums"]["role_type"]
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "view_bookings_with_user_info"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_roles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "view_user_ban_status"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      view_bookings_with_details: {
        Row: {
          booking_items: Json | null
          booking_number: string | null
          created_at: string | null
          id: string | null
          notes: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      view_bookings_with_user_info: {
        Row: {
          booking_number: string | null
          created_at: string | null
          created_at_text: string | null
          email: string | null
          full_name: string | null
          id: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          user_id: string | null
          visible_name: string | null
        }
        Relationships: []
      }
      view_item_location_summary: {
        Row: {
          item_name: string | null
          location_name: string | null
          organization_breakdown: string | null
          organizations_count: number | null
          storage_item_id: string | null
          total_at_location: number | null
        }
        Relationships: []
      }
      view_item_ownership_summary: {
        Row: {
          item_name: string | null
          location_name: string | null
          location_total: number | null
          organization_name: string | null
          owned_quantity: number | null
          storage_item_id: string | null
          total_across_all_locations: number | null
        }
        Relationships: []
      }
      view_manage_storage_items: {
        Row: {
          available_quantity: number | null
          created_at: string | null
          en_item_name: string | null
          en_item_type: string | null
          fi_item_name: string | null
          fi_item_type: string | null
          id: string | null
          is_active: boolean | null
          is_deleted: boolean | null
          location_id: string | null
          location_name: string | null
          organization_id: string | null
          quantity: number | null
          tag_ids: string[] | null
          tag_translations: Json[] | null
          translations: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      view_tag_popularity: {
        Row: {
          assigned_to: number | null
          created_at: string | null
          popularity_rank: string | null
          rank_percentile: number | null
          tag_id: string | null
          tag_name: string | null
          total_bookings: number | null
          translations: Json | null
        }
        Relationships: []
      }
      view_user_ban_status: {
        Row: {
          active_roles_count: number | null
          ban_reason: string | null
          ban_status: string | null
          banned_at: string | null
          banned_by: string | null
          banned_by_email: string | null
          banned_by_name: string | null
          email: string | null
          full_name: string | null
          id: string | null
          inactive_roles_count: number | null
          is_permanent: boolean | null
          latest_action: string | null
          latest_ban_type: string | null
          unbanned_at: string | null
          user_created_at: string | null
          visible_name: string | null
        }
        Relationships: []
      }
      view_user_roles_with_details: {
        Row: {
          assigned_at: string | null
          assignment_updated_at: string | null
          id: string | null
          is_active: boolean | null
          organization_id: string | null
          organization_is_active: boolean | null
          organization_name: string | null
          role_id: string | null
          role_name: Database["public"]["Enums"]["roles_type"] | null
          user_email: string | null
          user_full_name: string | null
          user_id: string | null
          user_phone: string | null
          user_visible_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erm_user_organization_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "erm_user_organization_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_storage_item_total: {
        Args: { item_id: string }
        Returns: number
      }
      cleanup_item_images: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notification: {
        Args: {
          p_channel?: Database["public"]["Enums"]["notification_channel"]
          p_idempotency_key?: string
          p_message?: string
          p_metadata?: Json
          p_severity?: Database["public"]["Enums"]["notification_severity"]
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: undefined
      }
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      get_all_full_bookings: {
        Args: { in_limit: number; in_offset: number }
        Returns: Json
      }
      get_all_full_orders: {
        Args: { in_limit?: number; in_offset?: number }
        Returns: Json
      }
      get_full_booking: {
        Args: { booking_id: string }
        Returns: Json
      }
      get_full_order: {
        Args: { order_id: string }
        Returns: Json
      }
      get_full_user_booking: {
        Args: { in_limit: number; in_offset: number; in_user_id: string }
        Returns: Json
      }
      get_full_user_order: {
        Args: { in_limit?: number; in_offset?: number; in_user_id: string }
        Returns: Json
      }
      get_latest_ban_record: {
        Args: { check_user_id: string }
        Returns: {
          action: string
          ban_reason: string
          ban_type: string
          banned_at: string
          banned_by: string
          id: string
          is_permanent: boolean
          organization_id: string
          role_assignment_id: string
          unbanned_at: string
        }[]
      }
      get_request_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_table_columns: {
        Args: { input_table_name: string }
        Returns: {
          column_name: string
          data_type: string
        }[]
      }
      get_user_roles: {
        Args: { user_uuid: string }
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          organization_id: string
          organization_name: string
          organization_slug: string
          role_id: string
          role_name: string
          user_id: string
        }[]
      }
      is_admin: {
        Args: { p_org_id?: string; p_user_id: string }
        Returns: boolean
      }
      is_user_banned_for_app: {
        Args: { check_user_id: string }
        Returns: boolean
      }
      is_user_banned_for_org: {
        Args: { check_org_id: string; check_user_id: string }
        Returns: boolean
      }
      is_user_banned_for_role: {
        Args: {
          check_org_id: string
          check_role_id: string
          check_user_id: string
        }
        Returns: boolean
      }
      notify: {
        Args: {
          p_channel?: Database["public"]["Enums"]["notification_channel"]
          p_message?: string
          p_metadata?: Json
          p_severity?: Database["public"]["Enums"]["notification_severity"]
          p_title?: string
          p_type_txt: string
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "rejected" | "cancelled"
      notification_channel: "in_app" | "web_push" | "email"
      notification_severity: "info" | "warning" | "critical"
      notification_type:
        | "comment"
        | "mention"
        | "system"
        | "custom"
        | "booking.status_approved"
        | "booking.status_rejected"
        | "booking.created"
        | "user.created"
      role_type:
        | "User"
        | "Admin"
        | "SuperVera"
        | "app_admin"
        | "main_admin"
        | "admin"
        | "user"
        | "superVera"
      roles_type:
        | "super_admin"
        | "main_admin"
        | "admin"
        | "user"
        | "superVera"
        | "storage_manager"
        | "requester"
        | "tenant_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      booking_status: ["pending", "confirmed", "rejected", "cancelled"],
      notification_channel: ["in_app", "web_push", "email"],
      notification_severity: ["info", "warning", "critical"],
      notification_type: [
        "comment",
        "mention",
        "system",
        "custom",
        "booking.status_approved",
        "booking.status_rejected",
        "booking.created",
        "user.created",
      ],
      role_type: [
        "User",
        "Admin",
        "SuperVera",
        "app_admin",
        "main_admin",
        "admin",
        "user",
        "superVera",
      ],
      roles_type: [
        "super_admin",
        "main_admin",
        "admin",
        "user",
        "superVera",
        "storage_manager",
        "requester",
        "tenant_admin",
      ],
    },
  },
} as const

