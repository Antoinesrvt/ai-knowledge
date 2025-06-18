ALTER TABLE "BranchRequest" DROP CONSTRAINT "BranchRequest_documentId_Document_id_fk";
--> statement-breakpoint
ALTER TABLE "ChatDocument" DROP CONSTRAINT "ChatDocument_documentId_Document_id_fk";
--> statement-breakpoint
ALTER TABLE "DocumentBranch" DROP CONSTRAINT "DocumentBranch_documentId_Document_id_fk";
--> statement-breakpoint
ALTER TABLE "BranchRequest" ADD COLUMN "documentCreatedAt" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "ChatDocument" ADD COLUMN "documentCreatedAt" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "DocumentBranch" ADD COLUMN "documentCreatedAt" timestamp NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BranchRequest" ADD CONSTRAINT "BranchRequest_documentId_documentCreatedAt_Document_id_createdAt_fk" FOREIGN KEY ("documentId","documentCreatedAt") REFERENCES "public"."Document"("id","createdAt") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ChatDocument" ADD CONSTRAINT "ChatDocument_documentId_documentCreatedAt_Document_id_createdAt_fk" FOREIGN KEY ("documentId","documentCreatedAt") REFERENCES "public"."Document"("id","createdAt") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DocumentBranch" ADD CONSTRAINT "DocumentBranch_documentId_documentCreatedAt_Document_id_createdAt_fk" FOREIGN KEY ("documentId","documentCreatedAt") REFERENCES "public"."Document"("id","createdAt") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
