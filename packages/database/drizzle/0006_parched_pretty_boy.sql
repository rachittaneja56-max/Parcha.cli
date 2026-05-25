ALTER TABLE "forms" ALTER COLUMN "theme" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "theme" SET DEFAULT 'terminal'::text;--> statement-breakpoint
DROP TYPE "public"."form_theme";--> statement-breakpoint
CREATE TYPE "public"."form_theme" AS ENUM('terminal', 'windows95', 'silicon_valley', 'silicon_valley_3d');--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "theme" SET DEFAULT 'terminal'::"public"."form_theme";--> statement-breakpoint
ALTER TABLE "forms" ALTER COLUMN "theme" SET DATA TYPE "public"."form_theme" USING "theme"::"public"."form_theme";