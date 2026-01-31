import { EmailVerificationTokenTableName } from "@dike/common";
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEmailVerificationTokenTable20260131130256 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "${EmailVerificationTokenTableName}" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "email" character varying NOT NULL,
        "token" character varying NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "used" boolean NOT NULL DEFAULT false,
        "ip" character varying,
        "user_agent" character varying,
        "created_at" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "revoked_at" timestamptz DEFAULT NULL,
        "hashed_token" character varying NOT NULL,
        CONSTRAINT "UQ_EmailVerificationTokenTableName_token" UNIQUE ("token"),
        CONSTRAINT "UQ_EmailVerificationTokenTableName_hashed_token" UNIQUE ("hashed_token"),
        CONSTRAINT "PK_EmailVerificationTokenTableName_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_EmailVerificationTokenTableName_email" ON "${EmailVerificationTokenTableName}" ("email")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_EmailVerificationTokenTableName_token" ON "${EmailVerificationTokenTableName}" ("token")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_EmailVerificationTokenTableName_hashed_token" ON "${EmailVerificationTokenTableName}" ("hashed_token")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "${EmailVerificationTokenTableName}"`);
  }
}
