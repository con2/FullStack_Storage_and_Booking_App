create sequence "public"."workflow_test_id_seq";

alter table "public"."booking_items" drop constraint "order_items_status_check";

drop view if exists "public"."view_bookings_with_details";

drop view if exists "public"."view_bookings_with_user_info";

create table "public"."workflow_test" (
    "id" integer not null default nextval('workflow_test_id_seq'::regclass),
    "name" text not null default 'test'::text,
    "created_at" timestamp with time zone not null default now()
);


alter table "public"."booking_items" alter column "status" set data type character varying using "status"::character varying;

alter table "public"."bookings" alter column "status" set data type character varying using "status"::character varying;

alter sequence "public"."workflow_test_id_seq" owned by "public"."workflow_test"."id";

drop type "public"."booking_status";

CREATE UNIQUE INDEX workflow_test_pkey ON public.workflow_test USING btree (id);

alter table "public"."workflow_test" add constraint "workflow_test_pkey" PRIMARY KEY using index "workflow_test_pkey";

alter table "public"."booking_items" add constraint "order_items_status_check" CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('confirmed'::character varying)::text, ('cancelled'::character varying)::text, ('picked_up'::character varying)::text, ('returned'::character varying)::text]))) not valid;

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


grant delete on table "public"."audit_logs" to "anon";

grant insert on table "public"."audit_logs" to "anon";

grant references on table "public"."audit_logs" to "anon";

grant select on table "public"."audit_logs" to "anon";

grant trigger on table "public"."audit_logs" to "anon";

grant truncate on table "public"."audit_logs" to "anon";

grant update on table "public"."audit_logs" to "anon";

grant delete on table "public"."audit_logs" to "authenticated";

grant insert on table "public"."audit_logs" to "authenticated";

grant references on table "public"."audit_logs" to "authenticated";

grant select on table "public"."audit_logs" to "authenticated";

grant trigger on table "public"."audit_logs" to "authenticated";

grant truncate on table "public"."audit_logs" to "authenticated";

grant update on table "public"."audit_logs" to "authenticated";

grant delete on table "public"."audit_logs" to "service_role";

grant insert on table "public"."audit_logs" to "service_role";

grant references on table "public"."audit_logs" to "service_role";

grant select on table "public"."audit_logs" to "service_role";

grant trigger on table "public"."audit_logs" to "service_role";

grant truncate on table "public"."audit_logs" to "service_role";

grant update on table "public"."audit_logs" to "service_role";

grant delete on table "public"."booking_items" to "anon";

grant insert on table "public"."booking_items" to "anon";

grant references on table "public"."booking_items" to "anon";

grant select on table "public"."booking_items" to "anon";

grant trigger on table "public"."booking_items" to "anon";

grant truncate on table "public"."booking_items" to "anon";

grant update on table "public"."booking_items" to "anon";

grant delete on table "public"."booking_items" to "authenticated";

grant insert on table "public"."booking_items" to "authenticated";

grant references on table "public"."booking_items" to "authenticated";

grant select on table "public"."booking_items" to "authenticated";

grant trigger on table "public"."booking_items" to "authenticated";

grant truncate on table "public"."booking_items" to "authenticated";

grant update on table "public"."booking_items" to "authenticated";

grant delete on table "public"."booking_items" to "service_role";

grant insert on table "public"."booking_items" to "service_role";

grant references on table "public"."booking_items" to "service_role";

grant select on table "public"."booking_items" to "service_role";

grant trigger on table "public"."booking_items" to "service_role";

grant truncate on table "public"."booking_items" to "service_role";

grant update on table "public"."booking_items" to "service_role";

grant delete on table "public"."bookings" to "anon";

grant insert on table "public"."bookings" to "anon";

grant references on table "public"."bookings" to "anon";

grant select on table "public"."bookings" to "anon";

grant trigger on table "public"."bookings" to "anon";

grant truncate on table "public"."bookings" to "anon";

grant update on table "public"."bookings" to "anon";

grant delete on table "public"."bookings" to "authenticated";

grant insert on table "public"."bookings" to "authenticated";

grant references on table "public"."bookings" to "authenticated";

grant select on table "public"."bookings" to "authenticated";

grant trigger on table "public"."bookings" to "authenticated";

grant truncate on table "public"."bookings" to "authenticated";

grant update on table "public"."bookings" to "authenticated";

grant delete on table "public"."bookings" to "service_role";

grant insert on table "public"."bookings" to "service_role";

grant references on table "public"."bookings" to "service_role";

grant select on table "public"."bookings" to "service_role";

grant trigger on table "public"."bookings" to "service_role";

grant truncate on table "public"."bookings" to "service_role";

grant update on table "public"."bookings" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";

grant delete on table "public"."organization_locations" to "anon";

grant insert on table "public"."organization_locations" to "anon";

grant references on table "public"."organization_locations" to "anon";

grant select on table "public"."organization_locations" to "anon";

grant trigger on table "public"."organization_locations" to "anon";

grant truncate on table "public"."organization_locations" to "anon";

grant update on table "public"."organization_locations" to "anon";

grant delete on table "public"."organization_locations" to "authenticated";

grant insert on table "public"."organization_locations" to "authenticated";

grant references on table "public"."organization_locations" to "authenticated";

grant select on table "public"."organization_locations" to "authenticated";

grant trigger on table "public"."organization_locations" to "authenticated";

grant truncate on table "public"."organization_locations" to "authenticated";

grant update on table "public"."organization_locations" to "authenticated";

grant delete on table "public"."organization_locations" to "service_role";

grant insert on table "public"."organization_locations" to "service_role";

grant references on table "public"."organization_locations" to "service_role";

grant select on table "public"."organization_locations" to "service_role";

grant trigger on table "public"."organization_locations" to "service_role";

grant truncate on table "public"."organization_locations" to "service_role";

grant update on table "public"."organization_locations" to "service_role";

grant delete on table "public"."organizations" to "anon";

grant insert on table "public"."organizations" to "anon";

grant references on table "public"."organizations" to "anon";

grant select on table "public"."organizations" to "anon";

grant trigger on table "public"."organizations" to "anon";

grant truncate on table "public"."organizations" to "anon";

grant update on table "public"."organizations" to "anon";

grant delete on table "public"."organizations" to "authenticated";

grant insert on table "public"."organizations" to "authenticated";

grant references on table "public"."organizations" to "authenticated";

grant select on table "public"."organizations" to "authenticated";

grant trigger on table "public"."organizations" to "authenticated";

grant truncate on table "public"."organizations" to "authenticated";

grant update on table "public"."organizations" to "authenticated";

grant delete on table "public"."organizations" to "service_role";

grant insert on table "public"."organizations" to "service_role";

grant references on table "public"."organizations" to "service_role";

grant select on table "public"."organizations" to "service_role";

grant trigger on table "public"."organizations" to "service_role";

grant truncate on table "public"."organizations" to "service_role";

grant update on table "public"."organizations" to "service_role";

grant select on table "public"."organizations" to "supabase_auth_admin";

grant delete on table "public"."promotions" to "anon";

grant insert on table "public"."promotions" to "anon";

grant references on table "public"."promotions" to "anon";

grant select on table "public"."promotions" to "anon";

grant trigger on table "public"."promotions" to "anon";

grant truncate on table "public"."promotions" to "anon";

grant update on table "public"."promotions" to "anon";

grant delete on table "public"."promotions" to "authenticated";

grant insert on table "public"."promotions" to "authenticated";

grant references on table "public"."promotions" to "authenticated";

grant select on table "public"."promotions" to "authenticated";

grant trigger on table "public"."promotions" to "authenticated";

grant truncate on table "public"."promotions" to "authenticated";

grant update on table "public"."promotions" to "authenticated";

grant delete on table "public"."promotions" to "service_role";

grant insert on table "public"."promotions" to "service_role";

grant references on table "public"."promotions" to "service_role";

grant select on table "public"."promotions" to "service_role";

grant trigger on table "public"."promotions" to "service_role";

grant truncate on table "public"."promotions" to "service_role";

grant update on table "public"."promotions" to "service_role";

grant delete on table "public"."reviews" to "anon";

grant insert on table "public"."reviews" to "anon";

grant references on table "public"."reviews" to "anon";

grant select on table "public"."reviews" to "anon";

grant trigger on table "public"."reviews" to "anon";

grant truncate on table "public"."reviews" to "anon";

grant update on table "public"."reviews" to "anon";

grant delete on table "public"."reviews" to "authenticated";

grant insert on table "public"."reviews" to "authenticated";

grant references on table "public"."reviews" to "authenticated";

grant select on table "public"."reviews" to "authenticated";

grant trigger on table "public"."reviews" to "authenticated";

grant truncate on table "public"."reviews" to "authenticated";

grant update on table "public"."reviews" to "authenticated";

grant delete on table "public"."reviews" to "service_role";

grant insert on table "public"."reviews" to "service_role";

grant references on table "public"."reviews" to "service_role";

grant select on table "public"."reviews" to "service_role";

grant trigger on table "public"."reviews" to "service_role";

grant truncate on table "public"."reviews" to "service_role";

grant update on table "public"."reviews" to "service_role";

grant delete on table "public"."roles" to "anon";

grant insert on table "public"."roles" to "anon";

grant references on table "public"."roles" to "anon";

grant select on table "public"."roles" to "anon";

grant trigger on table "public"."roles" to "anon";

grant truncate on table "public"."roles" to "anon";

grant update on table "public"."roles" to "anon";

grant delete on table "public"."roles" to "authenticated";

grant insert on table "public"."roles" to "authenticated";

grant references on table "public"."roles" to "authenticated";

grant select on table "public"."roles" to "authenticated";

grant trigger on table "public"."roles" to "authenticated";

grant truncate on table "public"."roles" to "authenticated";

grant update on table "public"."roles" to "authenticated";

grant delete on table "public"."roles" to "service_role";

grant insert on table "public"."roles" to "service_role";

grant references on table "public"."roles" to "service_role";

grant select on table "public"."roles" to "service_role";

grant trigger on table "public"."roles" to "service_role";

grant truncate on table "public"."roles" to "service_role";

grant update on table "public"."roles" to "service_role";

grant select on table "public"."roles" to "supabase_auth_admin";

grant delete on table "public"."storage_analytics" to "anon";

grant insert on table "public"."storage_analytics" to "anon";

grant references on table "public"."storage_analytics" to "anon";

grant select on table "public"."storage_analytics" to "anon";

grant trigger on table "public"."storage_analytics" to "anon";

grant truncate on table "public"."storage_analytics" to "anon";

grant update on table "public"."storage_analytics" to "anon";

grant delete on table "public"."storage_analytics" to "authenticated";

grant insert on table "public"."storage_analytics" to "authenticated";

grant references on table "public"."storage_analytics" to "authenticated";

grant select on table "public"."storage_analytics" to "authenticated";

grant trigger on table "public"."storage_analytics" to "authenticated";

grant truncate on table "public"."storage_analytics" to "authenticated";

grant update on table "public"."storage_analytics" to "authenticated";

grant delete on table "public"."storage_analytics" to "service_role";

grant insert on table "public"."storage_analytics" to "service_role";

grant references on table "public"."storage_analytics" to "service_role";

grant select on table "public"."storage_analytics" to "service_role";

grant trigger on table "public"."storage_analytics" to "service_role";

grant truncate on table "public"."storage_analytics" to "service_role";

grant update on table "public"."storage_analytics" to "service_role";

grant delete on table "public"."storage_compartments" to "anon";

grant insert on table "public"."storage_compartments" to "anon";

grant references on table "public"."storage_compartments" to "anon";

grant select on table "public"."storage_compartments" to "anon";

grant trigger on table "public"."storage_compartments" to "anon";

grant truncate on table "public"."storage_compartments" to "anon";

grant update on table "public"."storage_compartments" to "anon";

grant delete on table "public"."storage_compartments" to "authenticated";

grant insert on table "public"."storage_compartments" to "authenticated";

grant references on table "public"."storage_compartments" to "authenticated";

grant select on table "public"."storage_compartments" to "authenticated";

grant trigger on table "public"."storage_compartments" to "authenticated";

grant truncate on table "public"."storage_compartments" to "authenticated";

grant update on table "public"."storage_compartments" to "authenticated";

grant delete on table "public"."storage_compartments" to "service_role";

grant insert on table "public"."storage_compartments" to "service_role";

grant references on table "public"."storage_compartments" to "service_role";

grant select on table "public"."storage_compartments" to "service_role";

grant trigger on table "public"."storage_compartments" to "service_role";

grant truncate on table "public"."storage_compartments" to "service_role";

grant update on table "public"."storage_compartments" to "service_role";

grant delete on table "public"."storage_images" to "anon";

grant insert on table "public"."storage_images" to "anon";

grant references on table "public"."storage_images" to "anon";

grant select on table "public"."storage_images" to "anon";

grant trigger on table "public"."storage_images" to "anon";

grant truncate on table "public"."storage_images" to "anon";

grant update on table "public"."storage_images" to "anon";

grant delete on table "public"."storage_images" to "authenticated";

grant insert on table "public"."storage_images" to "authenticated";

grant references on table "public"."storage_images" to "authenticated";

grant select on table "public"."storage_images" to "authenticated";

grant trigger on table "public"."storage_images" to "authenticated";

grant truncate on table "public"."storage_images" to "authenticated";

grant update on table "public"."storage_images" to "authenticated";

grant delete on table "public"."storage_images" to "service_role";

grant insert on table "public"."storage_images" to "service_role";

grant references on table "public"."storage_images" to "service_role";

grant select on table "public"."storage_images" to "service_role";

grant trigger on table "public"."storage_images" to "service_role";

grant truncate on table "public"."storage_images" to "service_role";

grant update on table "public"."storage_images" to "service_role";

grant delete on table "public"."storage_item_images" to "anon";

grant insert on table "public"."storage_item_images" to "anon";

grant references on table "public"."storage_item_images" to "anon";

grant select on table "public"."storage_item_images" to "anon";

grant trigger on table "public"."storage_item_images" to "anon";

grant truncate on table "public"."storage_item_images" to "anon";

grant update on table "public"."storage_item_images" to "anon";

grant delete on table "public"."storage_item_images" to "authenticated";

grant insert on table "public"."storage_item_images" to "authenticated";

grant references on table "public"."storage_item_images" to "authenticated";

grant select on table "public"."storage_item_images" to "authenticated";

grant trigger on table "public"."storage_item_images" to "authenticated";

grant truncate on table "public"."storage_item_images" to "authenticated";

grant update on table "public"."storage_item_images" to "authenticated";

grant delete on table "public"."storage_item_images" to "service_role";

grant insert on table "public"."storage_item_images" to "service_role";

grant references on table "public"."storage_item_images" to "service_role";

grant select on table "public"."storage_item_images" to "service_role";

grant trigger on table "public"."storage_item_images" to "service_role";

grant truncate on table "public"."storage_item_images" to "service_role";

grant update on table "public"."storage_item_images" to "service_role";

grant delete on table "public"."storage_item_tags" to "anon";

grant insert on table "public"."storage_item_tags" to "anon";

grant references on table "public"."storage_item_tags" to "anon";

grant select on table "public"."storage_item_tags" to "anon";

grant trigger on table "public"."storage_item_tags" to "anon";

grant truncate on table "public"."storage_item_tags" to "anon";

grant update on table "public"."storage_item_tags" to "anon";

grant delete on table "public"."storage_item_tags" to "authenticated";

grant insert on table "public"."storage_item_tags" to "authenticated";

grant references on table "public"."storage_item_tags" to "authenticated";

grant select on table "public"."storage_item_tags" to "authenticated";

grant trigger on table "public"."storage_item_tags" to "authenticated";

grant truncate on table "public"."storage_item_tags" to "authenticated";

grant update on table "public"."storage_item_tags" to "authenticated";

grant delete on table "public"."storage_item_tags" to "service_role";

grant insert on table "public"."storage_item_tags" to "service_role";

grant references on table "public"."storage_item_tags" to "service_role";

grant select on table "public"."storage_item_tags" to "service_role";

grant trigger on table "public"."storage_item_tags" to "service_role";

grant truncate on table "public"."storage_item_tags" to "service_role";

grant update on table "public"."storage_item_tags" to "service_role";

grant delete on table "public"."storage_items" to "anon";

grant insert on table "public"."storage_items" to "anon";

grant references on table "public"."storage_items" to "anon";

grant select on table "public"."storage_items" to "anon";

grant trigger on table "public"."storage_items" to "anon";

grant truncate on table "public"."storage_items" to "anon";

grant update on table "public"."storage_items" to "anon";

grant delete on table "public"."storage_items" to "authenticated";

grant insert on table "public"."storage_items" to "authenticated";

grant references on table "public"."storage_items" to "authenticated";

grant select on table "public"."storage_items" to "authenticated";

grant trigger on table "public"."storage_items" to "authenticated";

grant truncate on table "public"."storage_items" to "authenticated";

grant update on table "public"."storage_items" to "authenticated";

grant delete on table "public"."storage_items" to "service_role";

grant insert on table "public"."storage_items" to "service_role";

grant references on table "public"."storage_items" to "service_role";

grant select on table "public"."storage_items" to "service_role";

grant trigger on table "public"."storage_items" to "service_role";

grant truncate on table "public"."storage_items" to "service_role";

grant update on table "public"."storage_items" to "service_role";

grant delete on table "public"."storage_locations" to "anon";

grant insert on table "public"."storage_locations" to "anon";

grant references on table "public"."storage_locations" to "anon";

grant select on table "public"."storage_locations" to "anon";

grant trigger on table "public"."storage_locations" to "anon";

grant truncate on table "public"."storage_locations" to "anon";

grant update on table "public"."storage_locations" to "anon";

grant delete on table "public"."storage_locations" to "authenticated";

grant insert on table "public"."storage_locations" to "authenticated";

grant references on table "public"."storage_locations" to "authenticated";

grant select on table "public"."storage_locations" to "authenticated";

grant trigger on table "public"."storage_locations" to "authenticated";

grant truncate on table "public"."storage_locations" to "authenticated";

grant update on table "public"."storage_locations" to "authenticated";

grant delete on table "public"."storage_locations" to "service_role";

grant insert on table "public"."storage_locations" to "service_role";

grant references on table "public"."storage_locations" to "service_role";

grant select on table "public"."storage_locations" to "service_role";

grant trigger on table "public"."storage_locations" to "service_role";

grant truncate on table "public"."storage_locations" to "service_role";

grant update on table "public"."storage_locations" to "service_role";

grant delete on table "public"."storage_working_hours" to "anon";

grant insert on table "public"."storage_working_hours" to "anon";

grant references on table "public"."storage_working_hours" to "anon";

grant select on table "public"."storage_working_hours" to "anon";

grant trigger on table "public"."storage_working_hours" to "anon";

grant truncate on table "public"."storage_working_hours" to "anon";

grant update on table "public"."storage_working_hours" to "anon";

grant delete on table "public"."storage_working_hours" to "authenticated";

grant insert on table "public"."storage_working_hours" to "authenticated";

grant references on table "public"."storage_working_hours" to "authenticated";

grant select on table "public"."storage_working_hours" to "authenticated";

grant trigger on table "public"."storage_working_hours" to "authenticated";

grant truncate on table "public"."storage_working_hours" to "authenticated";

grant update on table "public"."storage_working_hours" to "authenticated";

grant delete on table "public"."storage_working_hours" to "service_role";

grant insert on table "public"."storage_working_hours" to "service_role";

grant references on table "public"."storage_working_hours" to "service_role";

grant select on table "public"."storage_working_hours" to "service_role";

grant trigger on table "public"."storage_working_hours" to "service_role";

grant truncate on table "public"."storage_working_hours" to "service_role";

grant update on table "public"."storage_working_hours" to "service_role";

grant delete on table "public"."tags" to "anon";

grant insert on table "public"."tags" to "anon";

grant references on table "public"."tags" to "anon";

grant select on table "public"."tags" to "anon";

grant trigger on table "public"."tags" to "anon";

grant truncate on table "public"."tags" to "anon";

grant update on table "public"."tags" to "anon";

grant delete on table "public"."tags" to "authenticated";

grant insert on table "public"."tags" to "authenticated";

grant references on table "public"."tags" to "authenticated";

grant select on table "public"."tags" to "authenticated";

grant trigger on table "public"."tags" to "authenticated";

grant truncate on table "public"."tags" to "authenticated";

grant update on table "public"."tags" to "authenticated";

grant delete on table "public"."tags" to "service_role";

grant insert on table "public"."tags" to "service_role";

grant references on table "public"."tags" to "service_role";

grant select on table "public"."tags" to "service_role";

grant trigger on table "public"."tags" to "service_role";

grant truncate on table "public"."tags" to "service_role";

grant update on table "public"."tags" to "service_role";

grant delete on table "public"."test" to "anon";

grant insert on table "public"."test" to "anon";

grant references on table "public"."test" to "anon";

grant select on table "public"."test" to "anon";

grant trigger on table "public"."test" to "anon";

grant truncate on table "public"."test" to "anon";

grant update on table "public"."test" to "anon";

grant delete on table "public"."test" to "authenticated";

grant insert on table "public"."test" to "authenticated";

grant references on table "public"."test" to "authenticated";

grant select on table "public"."test" to "authenticated";

grant trigger on table "public"."test" to "authenticated";

grant truncate on table "public"."test" to "authenticated";

grant update on table "public"."test" to "authenticated";

grant delete on table "public"."test" to "service_role";

grant insert on table "public"."test" to "service_role";

grant references on table "public"."test" to "service_role";

grant select on table "public"."test" to "service_role";

grant trigger on table "public"."test" to "service_role";

grant truncate on table "public"."test" to "service_role";

grant update on table "public"."test" to "service_role";

grant delete on table "public"."test_features" to "anon";

grant insert on table "public"."test_features" to "anon";

grant references on table "public"."test_features" to "anon";

grant select on table "public"."test_features" to "anon";

grant trigger on table "public"."test_features" to "anon";

grant truncate on table "public"."test_features" to "anon";

grant update on table "public"."test_features" to "anon";

grant delete on table "public"."test_features" to "authenticated";

grant insert on table "public"."test_features" to "authenticated";

grant references on table "public"."test_features" to "authenticated";

grant select on table "public"."test_features" to "authenticated";

grant trigger on table "public"."test_features" to "authenticated";

grant truncate on table "public"."test_features" to "authenticated";

grant update on table "public"."test_features" to "authenticated";

grant delete on table "public"."test_features" to "service_role";

grant insert on table "public"."test_features" to "service_role";

grant references on table "public"."test_features" to "service_role";

grant select on table "public"."test_features" to "service_role";

grant trigger on table "public"."test_features" to "service_role";

grant truncate on table "public"."test_features" to "service_role";

grant update on table "public"."test_features" to "service_role";

grant delete on table "public"."user_addresses" to "anon";

grant insert on table "public"."user_addresses" to "anon";

grant references on table "public"."user_addresses" to "anon";

grant select on table "public"."user_addresses" to "anon";

grant trigger on table "public"."user_addresses" to "anon";

grant truncate on table "public"."user_addresses" to "anon";

grant update on table "public"."user_addresses" to "anon";

grant delete on table "public"."user_addresses" to "authenticated";

grant insert on table "public"."user_addresses" to "authenticated";

grant references on table "public"."user_addresses" to "authenticated";

grant select on table "public"."user_addresses" to "authenticated";

grant trigger on table "public"."user_addresses" to "authenticated";

grant truncate on table "public"."user_addresses" to "authenticated";

grant update on table "public"."user_addresses" to "authenticated";

grant delete on table "public"."user_addresses" to "service_role";

grant insert on table "public"."user_addresses" to "service_role";

grant references on table "public"."user_addresses" to "service_role";

grant select on table "public"."user_addresses" to "service_role";

grant trigger on table "public"."user_addresses" to "service_role";

grant truncate on table "public"."user_addresses" to "service_role";

grant update on table "public"."user_addresses" to "service_role";

grant delete on table "public"."user_ban_history" to "anon";

grant insert on table "public"."user_ban_history" to "anon";

grant references on table "public"."user_ban_history" to "anon";

grant select on table "public"."user_ban_history" to "anon";

grant trigger on table "public"."user_ban_history" to "anon";

grant truncate on table "public"."user_ban_history" to "anon";

grant update on table "public"."user_ban_history" to "anon";

grant delete on table "public"."user_ban_history" to "authenticated";

grant insert on table "public"."user_ban_history" to "authenticated";

grant references on table "public"."user_ban_history" to "authenticated";

grant select on table "public"."user_ban_history" to "authenticated";

grant trigger on table "public"."user_ban_history" to "authenticated";

grant truncate on table "public"."user_ban_history" to "authenticated";

grant update on table "public"."user_ban_history" to "authenticated";

grant delete on table "public"."user_ban_history" to "service_role";

grant insert on table "public"."user_ban_history" to "service_role";

grant references on table "public"."user_ban_history" to "service_role";

grant select on table "public"."user_ban_history" to "service_role";

grant trigger on table "public"."user_ban_history" to "service_role";

grant truncate on table "public"."user_ban_history" to "service_role";

grant update on table "public"."user_ban_history" to "service_role";

grant delete on table "public"."user_organization_roles" to "anon";

grant insert on table "public"."user_organization_roles" to "anon";

grant references on table "public"."user_organization_roles" to "anon";

grant select on table "public"."user_organization_roles" to "anon";

grant trigger on table "public"."user_organization_roles" to "anon";

grant truncate on table "public"."user_organization_roles" to "anon";

grant update on table "public"."user_organization_roles" to "anon";

grant delete on table "public"."user_organization_roles" to "authenticated";

grant insert on table "public"."user_organization_roles" to "authenticated";

grant references on table "public"."user_organization_roles" to "authenticated";

grant select on table "public"."user_organization_roles" to "authenticated";

grant trigger on table "public"."user_organization_roles" to "authenticated";

grant truncate on table "public"."user_organization_roles" to "authenticated";

grant update on table "public"."user_organization_roles" to "authenticated";

grant delete on table "public"."user_organization_roles" to "service_role";

grant insert on table "public"."user_organization_roles" to "service_role";

grant references on table "public"."user_organization_roles" to "service_role";

grant select on table "public"."user_organization_roles" to "service_role";

grant trigger on table "public"."user_organization_roles" to "service_role";

grant truncate on table "public"."user_organization_roles" to "service_role";

grant update on table "public"."user_organization_roles" to "service_role";

grant select on table "public"."user_organization_roles" to "supabase_auth_admin";

grant delete on table "public"."user_profiles" to "anon";

grant insert on table "public"."user_profiles" to "anon";

grant references on table "public"."user_profiles" to "anon";

grant select on table "public"."user_profiles" to "anon";

grant trigger on table "public"."user_profiles" to "anon";

grant truncate on table "public"."user_profiles" to "anon";

grant update on table "public"."user_profiles" to "anon";

grant delete on table "public"."user_profiles" to "authenticated";

grant insert on table "public"."user_profiles" to "authenticated";

grant references on table "public"."user_profiles" to "authenticated";

grant select on table "public"."user_profiles" to "authenticated";

grant trigger on table "public"."user_profiles" to "authenticated";

grant truncate on table "public"."user_profiles" to "authenticated";

grant update on table "public"."user_profiles" to "authenticated";

grant delete on table "public"."user_profiles" to "service_role";

grant insert on table "public"."user_profiles" to "service_role";

grant references on table "public"."user_profiles" to "service_role";

grant select on table "public"."user_profiles" to "service_role";

grant trigger on table "public"."user_profiles" to "service_role";

grant truncate on table "public"."user_profiles" to "service_role";

grant update on table "public"."user_profiles" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";

grant delete on table "public"."workflow_test" to "anon";

grant insert on table "public"."workflow_test" to "anon";

grant references on table "public"."workflow_test" to "anon";

grant select on table "public"."workflow_test" to "anon";

grant trigger on table "public"."workflow_test" to "anon";

grant truncate on table "public"."workflow_test" to "anon";

grant update on table "public"."workflow_test" to "anon";

grant delete on table "public"."workflow_test" to "authenticated";

grant insert on table "public"."workflow_test" to "authenticated";

grant references on table "public"."workflow_test" to "authenticated";

grant select on table "public"."workflow_test" to "authenticated";

grant trigger on table "public"."workflow_test" to "authenticated";

grant truncate on table "public"."workflow_test" to "authenticated";

grant update on table "public"."workflow_test" to "authenticated";

grant delete on table "public"."workflow_test" to "service_role";

grant insert on table "public"."workflow_test" to "service_role";

grant references on table "public"."workflow_test" to "service_role";

grant select on table "public"."workflow_test" to "service_role";

grant trigger on table "public"."workflow_test" to "service_role";

grant truncate on table "public"."workflow_test" to "service_role";

grant update on table "public"."workflow_test" to "service_role";


