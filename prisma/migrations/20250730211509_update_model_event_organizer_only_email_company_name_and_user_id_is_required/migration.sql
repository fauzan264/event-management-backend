-- AlterTable
ALTER TABLE "event_organizer" ALTER COLUMN "phone_number" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "website_url" DROP NOT NULL;
