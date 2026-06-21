CREATE TABLE "proposal" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"hire_id" uuid NOT NULL,
	"author_id" uuid NOT NULL,
	"amount" double precision NOT NULL,
	"round" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "proposal_hire_id_idx" ON "proposal" ("hire_id");--> statement-breakpoint
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_hire_id_hire_id_fkey" FOREIGN KEY ("hire_id") REFERENCES "hire"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE;