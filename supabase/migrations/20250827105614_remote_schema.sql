set check_function_bodies = off;

CREATE OR REPLACE FUNCTION extensions.grant_pg_net_access()
 RETURNS event_trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$function$
;

create type "public"."booking_status" as enum ('pending', 'confirmed', 'rejected', 'cancelled');

alter table "public"."booking_items" drop constraint "order_items_status_check";

drop view if exists "public"."view_bookings_with_details";

drop view if exists "public"."view_bookings_with_user_info";

alter table "public"."booking_items" alter column "status" set data type booking_status using "status"::booking_status;

alter table "public"."bookings" alter column "status" set data type booking_status using "status"::booking_status;

alter table "public"."booking_items" add constraint "order_items_status_check" CHECK ((status = ANY (ARRAY['pending'::booking_status, 'confirmed'::booking_status, 'cancelled'::booking_status, 'rejected'::booking_status]))) not valid;

alter table "public"."booking_items" validate constraint "order_items_status_check";

create or replace view "public"."view_bookings_with_details" as  SELECT b.id,
    b.booking_number,
    b.user_id,
    b.status,
    b.notes,
    b.created_at,
    b.updated_at,
    COALESCE(jsonb_agg(jsonb_build_object('id', bi.id, 'status', bi.status, 'item_id', bi.item_id, 'end_date', bi.end_date, 'quantity', bi.quantity, 'booking_id', bi.booking_id, 'created_at', bi.created_at, 'start_date', bi.start_date, 'total_days', bi.total_days, 'location_id', bi.location_id, 'provider_organization_id', bi.provider_organization_id, 'storage_items', jsonb_build_object('translations', si.translations))) FILTER (WHERE (bi.id IS NOT NULL)), '[]'::jsonb) AS booking_items
   FROM ((bookings b
     LEFT JOIN booking_items bi ON ((b.id = bi.booking_id)))
     LEFT JOIN storage_items si ON ((bi.item_id = si.id)))
  GROUP BY b.id, b.booking_number, b.user_id, b.status, b.notes, b.created_at, b.updated_at
  ORDER BY b.created_at DESC;


create or replace view "public"."view_bookings_with_user_info" as  SELECT b.id,
    b.status,
    b.created_at,
    b.booking_number,
    (b.created_at)::text AS created_at_text,
    u.full_name,
    u.visible_name,
    u.email,
    u.id AS user_id
   FROM (bookings b
     JOIN user_profiles u ON ((b.user_id = u.id)));



