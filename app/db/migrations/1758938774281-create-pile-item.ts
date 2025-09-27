import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePileItem1758938774281 implements MigrationInterface {
    name = 'CreatePileItem1758938774281'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."pile_item_status_enum" AS ENUM('queued', 'listened', 'dnf')`);
        await queryRunner.query(`CREATE TABLE "pile_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."pile_item_status_enum" NOT NULL DEFAULT 'queued', "artistName" text NOT NULL, "albumName" text NOT NULL, "owned" boolean NOT NULL DEFAULT false, "discogsReleaseId" text, "musicBrainzReleaseGroupId" text, "coverImage" bytea, "addedAt" TIMESTAMP NOT NULL DEFAULT now(), "listenedAt" TIMESTAMP, "didNotFinishAt" TIMESTAMP, "notes" text, "orderIndex" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_6683f1482fd111678a71c2b22cc" UNIQUE ("discogsReleaseId"), CONSTRAINT "UQ_e94d1c1024cf96ace3d570c374c" UNIQUE ("musicBrainzReleaseGroupId"), CONSTRAINT "PK_dc4de4b8395395046a04bbc3d38" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "email" text NOT NULL, "emailVerified" boolean NOT NULL, "image" text, "createdAt" date NOT NULL, "updatedAt" date NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "verification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "identifier" text NOT NULL, "value" text NOT NULL, "expiresAt" date NOT NULL, "createdAt" date NOT NULL, "updatedAt" date NOT NULL, CONSTRAINT "PK_f7e3a90ca384e71d6e2e93bb340" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "session" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "expiresAt" date NOT NULL, "token" text NOT NULL, "createdAt" date NOT NULL, "updatedAt" date NOT NULL, "ipAddress" text, "userAgent" text, "userId" text NOT NULL, CONSTRAINT "UQ_232f8e85d7633bd6ddfad421696" UNIQUE ("token"), CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountId" text NOT NULL, "providerId" text NOT NULL, "userId" text NOT NULL, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" date, "refreshTokenExpiresAt" date, "scope" text, "password" text, "createdAt" date NOT NULL, "updatedAt" date NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`DROP TABLE "verification"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "pile_item"`);
        await queryRunner.query(`DROP TYPE "public"."pile_item_status_enum"`);
    }

}
