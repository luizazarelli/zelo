CREATE TABLE "hire" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"hire_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"hire_id" uuid NOT NULL UNIQUE,
	"amount" double precision NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"paid_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"token" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_revoked" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_type" (
	"service_id" uuid PRIMARY KEY,
	"name" varchar(20) NOT NULL,
	"description" varchar DEFAULT 'Sem descrição' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"email" varchar NOT NULL UNIQUE,
	"password" varchar NOT NULL,
	"phone" varchar(25) NOT NULL,
	"profile_picture" varchar
);
--> statement-breakpoint
CREATE TABLE "worker" (
	"user_id" uuid PRIMARY KEY,
	"description" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"working_since" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worker_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"worker_id" uuid NOT NULL,
	"url" varchar NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worker_service_type" (
	"worker_id" uuid PRIMARY KEY,
	"service_type_id" uuid,
	CONSTRAINT "worker_service_type_worker_id_service_type_id_unique" UNIQUE("worker_id","service_type_id")
);
--> statement-breakpoint
CREATE INDEX "refresh_token_userid_idx" ON "refresh_tokens" ("user_id");--> statement-breakpoint
CREATE INDEX "user_name_idx" ON "users" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_idx" ON "users" ("email");--> statement-breakpoint
ALTER TABLE "hire" ADD CONSTRAINT "hire_client_id_users_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "hire" ADD CONSTRAINT "hire_worker_id_worker_user_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "worker"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "hire" ADD CONSTRAINT "hire_service_type_id_service_type_service_id_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_type"("service_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_hire_id_hire_id_fkey" FOREIGN KEY ("hire_id") REFERENCES "hire"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_users_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_hire_id_hire_id_fkey" FOREIGN KEY ("hire_id") REFERENCES "hire"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "worker" ADD CONSTRAINT "worker_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "worker_photos" ADD CONSTRAINT "worker_photos_worker_id_worker_user_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "worker"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "worker_service_type" ADD CONSTRAINT "worker_service_type_worker_id_worker_user_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "worker"("user_id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "worker_service_type" ADD CONSTRAINT "worker_service_type_5II5H6IxjohF_fkey" FOREIGN KEY ("service_type_id") REFERENCES "service_type"("service_id") ON DELETE CASCADE;