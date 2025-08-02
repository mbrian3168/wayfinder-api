-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "POICategory" AS ENUM ('LANDMARK', 'NATURE', 'PARTNER_LOCATION', 'FUN_FACT', 'TRAFFIC_ALERT');

-- CreateEnum
CREATE TYPE "HostPersonaType" AS ENUM ('HOST', 'NAVIGATOR');

-- CreateEnum
CREATE TYPE "TTSService" AS ENUM ('ELEVENLABS', 'GOOGLE_TTS', 'PLAY_HT');

-- CreateEnum
CREATE TYPE "BanterEventContext" AS ENUM ('TRAFFIC_JAM', 'BEAUTIFUL_WEATHER', 'HALFWAY_POINT', 'NEARING_DESTINATION');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "firebase_uid" TEXT NOT NULL,
    "active_trip_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "status" "TripStatus" NOT NULL DEFAULT 'ACTIVE',
    "origin_lat" DOUBLE PRECISION NOT NULL,
    "origin_lng" DOUBLE PRECISION NOT NULL,
    "destination_lat" DOUBLE PRECISION NOT NULL,
    "destination_lng" DOUBLE PRECISION NOT NULL,
    "route_geometry" JSONB,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pois" (
    "id" TEXT NOT NULL,
    "partner_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "POICategory" NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "geofence_radius_meters" INTEGER NOT NULL,

    CONSTRAINT "pois_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "poi_id" TEXT NOT NULL,
    "host_id" TEXT NOT NULL,
    "text_content" TEXT NOT NULL,
    "pregenerated_audio_url" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "triggers" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "conditions" JSONB NOT NULL,

    CONSTRAINT "triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "host_profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "persona_type" "HostPersonaType" NOT NULL,
    "description" TEXT NOT NULL,
    "tts_service" "TTSService" NOT NULL,
    "tts_voice_id" TEXT NOT NULL,

    CONSTRAINT "host_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audio_packs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "music_theme_id" TEXT NOT NULL,

    CONSTRAINT "audio_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banter_events" (
    "id" TEXT NOT NULL,
    "triggering_context" "BanterEventContext" NOT NULL,
    "host_line" TEXT NOT NULL,
    "navigator_line" TEXT NOT NULL,

    CONSTRAINT "banter_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AudioPackHosts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "partners_contact_email_key" ON "partners"("contact_email");

-- CreateIndex
CREATE UNIQUE INDEX "host_profiles_name_key" ON "host_profiles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "audio_packs_name_key" ON "audio_packs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_AudioPackHosts_AB_unique" ON "_AudioPackHosts"("A", "B");

-- CreateIndex
CREATE INDEX "_AudioPackHosts_B_index" ON "_AudioPackHosts"("B");

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "host_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pois" ADD CONSTRAINT "pois_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_poi_id_fkey" FOREIGN KEY ("poi_id") REFERENCES "pois"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "host_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triggers" ADD CONSTRAINT "triggers_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AudioPackHosts" ADD CONSTRAINT "_AudioPackHosts_A_fkey" FOREIGN KEY ("A") REFERENCES "audio_packs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AudioPackHosts" ADD CONSTRAINT "_AudioPackHosts_B_fkey" FOREIGN KEY ("B") REFERENCES "host_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
