CREATE TABLE IF NOT EXISTS "DocumentMainChat" (
	"documentId" uuid NOT NULL,
	"documentCreatedAt" timestamp NOT NULL,
	"chatId" uuid NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deactivatedAt" timestamp,
	CONSTRAINT "DocumentMainChat_documentId_chatId_pk" PRIMARY KEY("documentId","chatId")
);
--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "workspaceType" varchar;--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "primaryDocumentId" uuid;--> statement-breakpoint
ALTER TABLE "Chat" ADD COLUMN "primaryDocumentCreatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "ChatDocument" ADD COLUMN "relationshipType" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "Document" ADD COLUMN "currentMainChatId" uuid;--> statement-breakpoint
ALTER TABLE "Document" ADD COLUMN "lastViewMode" varchar DEFAULT 'document';--> statement-breakpoint
ALTER TABLE "Document" ADD COLUMN "lastAccessedAt" timestamp DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DocumentMainChat" ADD CONSTRAINT "DocumentMainChat_chatId_Chat_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "DocumentMainChat" ADD CONSTRAINT "DocumentMainChat_documentId_documentCreatedAt_Document_id_createdAt_fk" FOREIGN KEY ("documentId","documentCreatedAt") REFERENCES "public"."Document"("id","createdAt") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "ChatDocument" DROP COLUMN IF EXISTS "linkType";