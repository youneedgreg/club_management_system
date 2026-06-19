CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent');--> statement-breakpoint
CREATE TYPE "public"."booking_role" AS ENUM('actDj', 'actMc', 'actHost');--> statement-breakpoint
CREATE TYPE "public"."domain" AS ENUM('bar', 'kitchen');--> statement-breakpoint
CREATE TYPE "public"."fee_type" AS ENUM('fixed', 'pct');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('preparing', 'served');--> statement-breakpoint
CREATE TYPE "public"."pay_status" AS ENUM('pending', 'paid');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('mpesa', 'cash', 'card');--> statement-breakpoint
CREATE TYPE "public"."product_category" AS ENUM('spirits', 'beer', 'wine', 'soft', 'shisha', 'cigarettes');--> statement-breakpoint
CREATE TYPE "public"."staff_role" AS ENUM('supervisor', 'cashier', 'bartender', 'waiter', 'securityRole', 'dj', 'mc', 'host');--> statement-breakpoint
CREATE TYPE "public"."staff_type" AS ENUM('tonight', 'permanent', 'casual');--> statement-breakpoint
CREATE TYPE "public"."stock_movement_type" AS ENUM('delivery', 'sale', 'adjustment', 'count');--> statement-breakpoint
CREATE TYPE "public"."supplier_category" AS ENUM('drinks', 'food', 'utilities', 'services');--> statement-breakpoint
CREATE TABLE "expense_categories" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"domain" "domain" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "income_categories" (
	"key" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"domain" "domain" NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"tagline" text,
	"location" text,
	"owner" text,
	"open_time" text,
	"close_time" text,
	"currency" text DEFAULT 'KSh' NOT NULL,
	"mpesa_paybill" text,
	"low_stock_threshold" integer DEFAULT 0 NOT NULL,
	"timezone" text DEFAULT 'Africa/Nairobi' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "credit_customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"name" text NOT NULL,
	"note" text,
	"phone" text,
	"balance" bigint DEFAULT 0 NOT NULL,
	"last_paid_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "credit_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"method" "payment_method" NOT NULL,
	"occurred_at" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"label" text NOT NULL,
	"category_key" text NOT NULL,
	"domain" "domain" NOT NULL,
	"amount" bigint NOT NULL,
	"recurring" boolean DEFAULT false NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"business_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "supplier_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier_id" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"method" "payment_method" NOT NULL,
	"reference" text,
	"occurred_at" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" "supplier_category" NOT NULL,
	"phone" text,
	"terms" text,
	"owed" bigint DEFAULT 0 NOT NULL,
	"last_order_at" date,
	"due_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" "product_category" NOT NULL,
	"unit" text NOT NULL,
	"on_hand" integer DEFAULT 0 NOT NULL,
	"par" integer DEFAULT 0 NOT NULL,
	"cost" bigint DEFAULT 0 NOT NULL,
	"sell" bigint DEFAULT 0 NOT NULL,
	"supplier_id" uuid,
	"delivered_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"type" "stock_movement_type" NOT NULL,
	"qty" integer NOT NULL,
	"note" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sale_id" uuid NOT NULL,
	"product_id" uuid,
	"description" text,
	"qty" integer DEFAULT 1 NOT NULL,
	"unit_price" bigint DEFAULT 0 NOT NULL,
	"line_total" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"business_date" date NOT NULL,
	"location" text,
	"description" text,
	"payment_method" "payment_method" NOT NULL,
	"amount" bigint NOT NULL,
	"income_category_key" text,
	"staff_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "kitchen_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"business_date" date NOT NULL,
	"location" text,
	"item" text NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"amount" bigint NOT NULL,
	"status" "order_status" DEFAULT 'preparing' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "advances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"note" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"staff_id" uuid NOT NULL,
	"business_date" date NOT NULL,
	"status" "attendance_status" NOT NULL,
	"clock_in" timestamp with time zone,
	"wage" bigint DEFAULT 0 NOT NULL,
	"is_fee" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	CONSTRAINT "attendance_staff_date_uniq" UNIQUE("staff_id","business_date")
);
--> statement-breakpoint
CREATE TABLE "pos_attributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"business_date" date NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"location" text,
	"amount" bigint NOT NULL,
	"commission" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"name" text NOT NULL,
	"role" "staff_role" NOT NULL,
	"type" "staff_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	CONSTRAINT "staff_club_name_uniq" UNIQUE("club_id","name")
);
--> statement-breakpoint
CREATE TABLE "staff_casuals" (
	"staff_id" uuid PRIMARY KEY NOT NULL,
	"daily_rate" bigint NOT NULL,
	"days_worked" integer DEFAULT 0 NOT NULL,
	"deduction" bigint DEFAULT 0 NOT NULL,
	"advance" bigint DEFAULT 0 NOT NULL,
	"pos_linked" boolean DEFAULT false NOT NULL,
	"pos_sales" bigint DEFAULT 0 NOT NULL,
	"commission_pct" numeric(5, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "staff_permanent" (
	"staff_id" uuid PRIMARY KEY NOT NULL,
	"salary" bigint NOT NULL,
	"nhif" bigint DEFAULT 0 NOT NULL,
	"nssf" bigint DEFAULT 0 NOT NULL,
	"paye" bigint DEFAULT 0 NOT NULL,
	"advance" bigint DEFAULT 0 NOT NULL,
	"pay_status" "pay_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "booking_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"amount" bigint NOT NULL,
	"method" "payment_method" NOT NULL,
	"mpesa_code" text,
	"receipt_no" text,
	"occurred_at" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"night_id" uuid,
	"booking_date" date NOT NULL,
	"act_name" text NOT NULL,
	"role" "booking_role" NOT NULL,
	"set_time" text,
	"fee_type" "fee_type" DEFAULT 'fixed' NOT NULL,
	"fee" bigint DEFAULT 0 NOT NULL,
	"pct" numeric(5, 2),
	"guest" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "lineup_nights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"date" date NOT NULL,
	"label" text,
	"flagship" boolean DEFAULT false NOT NULL,
	"closed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	CONSTRAINT "lineup_nights_club_date_uniq" UNIQUE("club_id","date")
);
--> statement-breakpoint
CREATE TABLE "expense_by_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"period_month" date NOT NULL,
	"domain" "domain" DEFAULT 'bar' NOT NULL,
	"category_key" text NOT NULL,
	"amount" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "income_by_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"business_date" date NOT NULL,
	"domain" "domain" DEFAULT 'bar' NOT NULL,
	"category_key" text NOT NULL,
	"amount" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "monthly_revenue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"month" date NOT NULL,
	"month_label" text,
	"revenue" bigint NOT NULL,
	"partial" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	CONSTRAINT "monthly_revenue_club_month_uniq" UNIQUE("club_id","month")
);
--> statement-breakpoint
CREATE TABLE "night_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"business_date" date NOT NULL,
	"door_entries" integer DEFAULT 0 NOT NULL,
	"tables_open" integer DEFAULT 0 NOT NULL,
	"biggest_sale" bigint DEFAULT 0 NOT NULL,
	"peak_hour" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	CONSTRAINT "night_stats_club_date_uniq" UNIQUE("club_id","business_date")
);
--> statement-breakpoint
CREATE TABLE "nightly_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"business_date" date NOT NULL,
	"day_label" text,
	"label" text,
	"revenue" bigint DEFAULT 0 NOT NULL,
	"cost" bigint DEFAULT 0 NOT NULL,
	"closed" boolean DEFAULT false NOT NULL,
	"flagship" boolean DEFAULT false NOT NULL,
	"is_tonight" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid,
	CONSTRAINT "nightly_snapshots_club_date_uniq" UNIQUE("club_id","business_date")
);
--> statement-breakpoint
CREATE TABLE "payment_mix" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"business_date" date NOT NULL,
	"method" "payment_method" NOT NULL,
	"pct" numeric(5, 2) NOT NULL,
	"amount" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "revenue_by_hour" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"business_date" date NOT NULL,
	"domain" "domain" DEFAULT 'bar' NOT NULL,
	"hour" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"amount" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "top_sellers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"club_id" uuid NOT NULL,
	"business_date" date NOT NULL,
	"product_name" text NOT NULL,
	"category" text NOT NULL,
	"units" integer NOT NULL,
	"revenue" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
ALTER TABLE "credit_customers" ADD CONSTRAINT "credit_customers_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_payments" ADD CONSTRAINT "credit_payments_customer_id_credit_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."credit_customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_key_expense_categories_key_fk" FOREIGN KEY ("category_key") REFERENCES "public"."expense_categories"("key") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_payments" ADD CONSTRAINT "supplier_payments_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_income_category_key_income_categories_key_fk" FOREIGN KEY ("income_category_key") REFERENCES "public"."income_categories"("key") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kitchen_orders" ADD CONSTRAINT "kitchen_orders_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "advances" ADD CONSTRAINT "advances_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_attributions" ADD CONSTRAINT "pos_attributions_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_attributions" ADD CONSTRAINT "pos_attributions_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_casuals" ADD CONSTRAINT "staff_casuals_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_permanent" ADD CONSTRAINT "staff_permanent_staff_id_staff_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_payments" ADD CONSTRAINT "booking_payments_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_night_id_lineup_nights_id_fk" FOREIGN KEY ("night_id") REFERENCES "public"."lineup_nights"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lineup_nights" ADD CONSTRAINT "lineup_nights_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_by_category" ADD CONSTRAINT "expense_by_category_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income_by_category" ADD CONSTRAINT "income_by_category_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_revenue" ADD CONSTRAINT "monthly_revenue_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_stats" ADD CONSTRAINT "night_stats_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nightly_snapshots" ADD CONSTRAINT "nightly_snapshots_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_mix" ADD CONSTRAINT "payment_mix_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_by_hour" ADD CONSTRAINT "revenue_by_hour_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "top_sellers" ADD CONSTRAINT "top_sellers_club_id_clubs_id_fk" FOREIGN KEY ("club_id") REFERENCES "public"."clubs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "credit_customers_club_idx" ON "credit_customers" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "credit_payments_customer_idx" ON "credit_payments" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "expenses_club_date_idx" ON "expenses" USING btree ("club_id","business_date","domain");--> statement-breakpoint
CREATE INDEX "supplier_payments_supplier_idx" ON "supplier_payments" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "suppliers_club_idx" ON "suppliers" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "products_club_idx" ON "products" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("club_id","category");--> statement-breakpoint
CREATE INDEX "stock_movements_product_idx" ON "stock_movements" USING btree ("product_id","occurred_at");--> statement-breakpoint
CREATE INDEX "sale_items_sale_idx" ON "sale_items" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "sales_club_date_idx" ON "sales" USING btree ("club_id","business_date");--> statement-breakpoint
CREATE INDEX "sales_payment_idx" ON "sales" USING btree ("payment_method");--> statement-breakpoint
CREATE INDEX "kitchen_orders_club_date_idx" ON "kitchen_orders" USING btree ("club_id","business_date","status");--> statement-breakpoint
CREATE INDEX "advances_staff_idx" ON "advances" USING btree ("staff_id");--> statement-breakpoint
CREATE INDEX "attendance_date_idx" ON "attendance" USING btree ("business_date");--> statement-breakpoint
CREATE INDEX "pos_attributions_staff_idx" ON "pos_attributions" USING btree ("staff_id","business_date");--> statement-breakpoint
CREATE INDEX "staff_club_idx" ON "staff" USING btree ("club_id");--> statement-breakpoint
CREATE INDEX "booking_payments_booking_idx" ON "booking_payments" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "bookings_club_date_idx" ON "bookings" USING btree ("club_id","booking_date");--> statement-breakpoint
CREATE INDEX "expense_by_category_idx" ON "expense_by_category" USING btree ("club_id","period_month","domain");--> statement-breakpoint
CREATE INDEX "income_by_category_idx" ON "income_by_category" USING btree ("club_id","business_date","domain");--> statement-breakpoint
CREATE INDEX "payment_mix_idx" ON "payment_mix" USING btree ("club_id","business_date");--> statement-breakpoint
CREATE INDEX "revenue_by_hour_idx" ON "revenue_by_hour" USING btree ("club_id","business_date","domain");--> statement-breakpoint
CREATE INDEX "top_sellers_idx" ON "top_sellers" USING btree ("club_id","business_date");