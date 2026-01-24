import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateRolesTable20251202114227 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // TODO: scrivi qui la logica per applicare la migrazione
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // TODO: scrivi qui la logica per annullare la migrazione
  }
}
