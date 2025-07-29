-- CreateEnum
CREATE TYPE "Category" AS ENUM ('MUSIC', 'SPORT', 'EDUCATION');

-- CreateEnum
CREATE TYPE "providerType" AS ENUM ('APP', 'EVENT_ORGANIZER');

-- CreateTable
CREATE TABLE "event_organizer" (
    "id" VARCHAR(36) NOT NULL,
    "company_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(36) NOT NULL,
    "phone_number" VARCHAR(36) NOT NULL,
    "address" TEXT NOT NULL,
    "website_url" TEXT NOT NULL,
    "bank_account" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "event_organizer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" VARCHAR(36) NOT NULL,
    "event_name" VARCHAR(100) NOT NULL,
    "category" "Category" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "venue_id" VARCHAR(36) NOT NULL,
    "description" TEXT NOT NULL,
    "available_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue" (
    "id" VARCHAR(36) NOT NULL,
    "venue_name" VARCHAR(36) NOT NULL,
    "venue_capacity" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coupon" (
    "id" VARCHAR(36) NOT NULL,
    "discount_value" INTEGER NOT NULL,
    "provider_type" "providerType" NOT NULL,
    "event_organizer_id" VARCHAR(36) NOT NULL,
    "description" TEXT NOT NULL,
    "availableCoupon" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" VARCHAR(36) NOT NULL,
    "fullname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "event_id" VARCHAR(36),
    "venue_id" VARCHAR(36),
    "quantity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "coupon_id" VARCHAR(36) NOT NULL,
    "user_points_id" TEXT NOT NULL,
    "final_price" INTEGER NOT NULL,
    "payment_proof" TEXT NOT NULL,
    "order_status" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimoni" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36),
    "event_id" VARCHAR(36),
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,

    CONSTRAINT "testimoni_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "coupon" ADD CONSTRAINT "coupon_event_organizer_id_fkey" FOREIGN KEY ("event_organizer_id") REFERENCES "event_organizer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_venue_id_fkey" FOREIGN KEY ("venue_id") REFERENCES "venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_user_points_id_fkey" FOREIGN KEY ("user_points_id") REFERENCES "user_points"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimoni" ADD CONSTRAINT "testimoni_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimoni" ADD CONSTRAINT "testimoni_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
