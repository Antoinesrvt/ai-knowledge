CREATE TABLE IF NOT EXISTS "PendingChange" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"documentId" uuid NOT NULL,
	"documentCreatedAt" timestamp NOT NULL,
	"changes" json NOT NULL,
	"description" text NOT NULL,
	"changeType" varchar NOT NULL,
	"authorType" varchar NOT NULL,
	"authorId" uuid NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"resolvedAt" timestamp
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "PendingChange" ADD CONSTRAINT "PendingChange_documentId_documentCreatedAt_Document_id_createdAt_fk" FOREIGN KEY ("documentId","documentCreatedAt") REFERENCES "public"."Document"("id","createdAt") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
