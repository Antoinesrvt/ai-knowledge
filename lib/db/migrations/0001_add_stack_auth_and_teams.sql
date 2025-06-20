-- Add Stack Auth fields to User table
ALTER TABLE "User" ADD COLUMN "stackUserId" varchar(255);
ALTER TABLE "User" ADD COLUMN "displayName" varchar(255);
ALTER TABLE "User" ADD COLUMN "profileImageUrl" text;
ALTER TABLE "User" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;
ALTER TABLE "User" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;

-- Add unique constraint for stackUserId
ALTER TABLE "User" ADD CONSTRAINT "User_stackUserId_unique" UNIQUE("stackUserId");

-- Create Organization table
CREATE TABLE IF NOT EXISTS "Organization" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"logoUrl" text,
	"stackTeamId" varchar(255),
	"plan" varchar DEFAULT 'free' NOT NULL,
	"maxMembers" integer DEFAULT 5,
	"maxDocuments" integer DEFAULT 100,
	"maxChats" integer DEFAULT 500,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Organization_slug_unique" UNIQUE("slug"),
	CONSTRAINT "Organization_stackTeamId_unique" UNIQUE("stackTeamId")
);

-- Create OrganizationMember table
CREATE TABLE IF NOT EXISTS "OrganizationMember" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizationId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" varchar DEFAULT 'member' NOT NULL,
	"permissions" json,
	"invitedAt" timestamp,
	"joinedAt" timestamp DEFAULT now() NOT NULL,
	"invitedBy" uuid,
	CONSTRAINT "OrganizationMember_organizationId_userId_pk" PRIMARY KEY("organizationId","userId")
);

-- Create Team table
CREATE TABLE IF NOT EXISTS "Team" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organizationId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"color" varchar(7),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Create TeamMember table
CREATE TABLE IF NOT EXISTS "TeamMember" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teamId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"role" varchar DEFAULT 'member' NOT NULL,
	"joinedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "TeamMember_teamId_userId_pk" PRIMARY KEY("teamId","userId")
);

-- Add organization and team columns to Chat table
ALTER TABLE "Chat" ADD COLUMN "organizationId" uuid;
ALTER TABLE "Chat" ADD COLUMN "teamId" uuid;

-- Update Chat visibility enum
ALTER TABLE "Chat" ALTER COLUMN "visibility" TYPE varchar;
ALTER TABLE "Chat" ALTER COLUMN "visibility" SET DEFAULT 'private';

-- Add organization and team columns to Document table
ALTER TABLE "Document" ADD COLUMN "organizationId" uuid;
ALTER TABLE "Document" ADD COLUMN "teamId" uuid;

-- Update Document visibility enum
ALTER TABLE "Document" ALTER COLUMN "visibility" TYPE varchar;
ALTER TABLE "Document" ALTER COLUMN "visibility" SET DEFAULT 'private';

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_Organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_invitedBy_User_id_fk" FOREIGN KEY ("invitedBy") REFERENCES "User"("id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "Team" ADD CONSTRAINT "Team_organizationId_Organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_Team_id_fk" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_User_id_fk" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "Chat" ADD CONSTRAINT "Chat_organizationId_Organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "Chat" ADD CONSTRAINT "Chat_teamId_Team_id_fk" FOREIGN KEY ("teamId") REFERENCES "Team"("id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "Document" ADD CONSTRAINT "Document_organizationId_Organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "Document" ADD CONSTRAINT "Document_teamId_Team_id_fk" FOREIGN KEY ("teamId") REFERENCES "Team"("id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;