CREATE TABLE "hire" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"worker_id" uuid NOT NULL,
	"service_type_id" uuid NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hire_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hire_id" uuid NOT NULL,
	"amount" double precision NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp,
	CONSTRAINT "payment_hire_id_unique" UNIQUE("hire_id")
);
--> statement-breakpoint
ALTER TABLE "hire" ADD CONSTRAINT "hire_client_id_user_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "hire" ADD CONSTRAINT "hire_worker_id_worker_user_id_fk" FOREIGN KEY ("worker_id") REFERENCES "public"."worker"("user_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "hire" ADD CONSTRAINT "hire_service_type_id_service_type_service_id_fk" FOREIGN KEY ("service_type_id") REFERENCES "public"."service_type"("service_id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_hire_id_hire_id_fk" FOREIGN KEY ("hire_id") REFERENCES "public"."hire"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_hire_id_hire_id_fk" FOREIGN KEY ("hire_id") REFERENCES "public"."hire"("id") ON DELETE cascade ON UPDATE no action;
