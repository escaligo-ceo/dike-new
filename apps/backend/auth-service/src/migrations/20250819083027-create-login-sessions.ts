import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateLoginSessions20250819083027 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'login_sessions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'userId',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'preferredUsername',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'emailVerified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'successful',
            type: 'boolean',
            default: false,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'userAgent',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_LOGIN_SESSIONS_USERID',
            columnNames: ['userId'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('login_sessions');
  }
}
