CREATE TABLE IF NOT EXISTS "BranchRequest" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"documentId" uuid NOT NULL,
	"proposedName" varchar(255) NOT NULL,
	"reason" text,
	"requestedByType" varchar NOT NULL,
	"requestedById" uuid NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"respondedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ChatDocument" (
	"chatId" uuid NOT NULL,
	"documentId" uuid NOT NULL,
	"branchId" uuid,
	"linkedAt" timestamp DEFAULT now() NOT NULL,
	"linkType" varchar NOT NULL,
	CONSTRAINT "ChatDocument_chatId_documentId_pk" PRIMARY KEY("chatId","documentId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DocumentBranch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"documentId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"parentBranchId" uuid,
	"createdByType" varchar NOT NULL,
	"createdById" uuid NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DocumentMerge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sourceBranchId" uuid NOT NULL,
	"targetBranchId" uuid NOT NULL,
	"mergedVersionId" uuid NOT NULL,
	"mergedByType" varchar NOT NULL,
	"mergedById" uuid NOT NULL,
	"mergeStrategy" varchar DEFAULT 'manual' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "DocumentVersion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"branchId" uuid NOT NULL,
	"content" text NOT NULL,
	"commitMessage" text,
	"authorType" varchar NOT NULL,
	"authorId" uuid NOT NULL,
	"parentVersionId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "Document" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "BranchRequest" ADD CONSTRAINT "BranchRequest_documentId_Document_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ChatDocument" ADD CONSTRAINT "ChatDocument_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ChatDocument" ADD CONSTRAINT "ChatDocument_documentId_Document_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ChatDocument" ADD CONSTRAINT "ChatDocument_branchId_DocumentBranch_id_fk" FOREIGN KEY ("branchId") REFERENCES "public"."DocumentBranch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DocumentBranch" ADD CONSTRAINT "DocumentBranch_documentId_Document_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DocumentBranch" ADD CONSTRAINT "DocumentBranch_parentBranchId_DocumentBranch_id_fk" FOREIGN KEY ("parentBranchId") REFERENCES "public"."DocumentBranch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DocumentMerge" ADD CONSTRAINT "DocumentMerge_sourceBranchId_DocumentBranch_id_fk" FOREIGN KEY ("sourceBranchId") REFERENCES "public"."DocumentBranch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DocumentMerge" ADD CONSTRAINT "DocumentMerge_targetBranchId_DocumentBranch_id_fk" FOREIGN KEY ("targetBranchId") REFERENCES "public"."DocumentBranch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DocumentMerge" ADD CONSTRAINT "DocumentMerge_mergedVersionId_DocumentVersion_id_fk" FOREIGN KEY ("mergedVersionId") REFERENCES "public"."DocumentVersion"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_branchId_DocumentBranch_id_fk" FOREIGN KEY ("branchId") REFERENCES "public"."DocumentBranch"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DocumentVersion" ADD CONSTRAINT "DocumentVersion_parentVersionId_DocumentVersion_id_fk" FOREIGN KEY ("parentVersionId") REFERENCES "public"."DocumentVersion"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
