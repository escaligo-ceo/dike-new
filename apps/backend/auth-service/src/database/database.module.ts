import {
  DbConnection,
  DikeConfigService,
  DikeDataSource,
  DikeModule,
  Seed,
} from "@dike/common";
import { HttpStatus, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import path from "path";
import { Client } from "pg";
import { Migration } from "typeorm";
import { EmailVerificationToken } from "../entities/email-verification-token.entity";
import { LoginSession } from "../entities/login-session.entity";
import { WatchedPerson } from "../entities/watched-person.entity";

@Module({
  imports: [
    DikeModule,
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, DikeModule],
      inject: [DikeConfigService],
      useFactory: async (configService: DikeConfigService) => {
        const postgresConnectionStr = configService.env(
          "POSTGRES_CONNECTION_STR",
          "postgres://escaligo_admin:superpassword@postgres:5432/postgres"
        );

        const postgresDbParams: DbConnection = new DbConnection(
          postgresConnectionStr
        );

        const postgresDbClient = postgresDbParams.getClient();

        try {
          await postgresDbClient.connect();
          console.log("✓ Connected to PostgreSQL");
        } catch (error) {
          console.error("✘ Error connecting to PostgreSQL:", error);
          throw error;
        }

        const serviceDbConnectionStr = configService.env(
          "SERVICE_DB_CONNECTION_STR",
          "postgres://auth-service_admin:auth-service_password@localhost:5432/auth_db"
        );
        const serviceDbParams = new DbConnection(serviceDbConnectionStr);

        const username = serviceDbParams.username;
        const password = serviceDbParams.password;
        const dbName = serviceDbParams.dbName;

        try {
          const dbExists = await postgresDbClient.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
          );
          if (dbExists.rowCount === 0) {
            console.log(`🔧 Creating database "${dbName}"...`);
            await postgresDbClient.query(`CREATE DATABASE "${dbName}"`);
          } else {
            console.log(`ℹ️ Database "${dbName}" already exists.`);
          }
        } catch (err) {
          console.error("✘ Error creating database:", err);
          throw err;
        }

        try {
          const userCheck = await postgresDbClient.query(
            "SELECT 1 FROM pg_user WHERE usename = $1",
            [username]
          );
          if (userCheck.rowCount === 0) {
            console.log(`🔧 Creating user "${username}"...`);

            let createdUser = false;
            let userRetries = 3;
            while (!createdUser && userRetries > 0) {
              try {
                await postgresDbClient.query(
                  `CREATE USER "${username}" WITH PASSWORD '${password}'`
                );
                createdUser = true;
              } catch (err: any) {
                if (err.code === "42710") {
                  // duplicate_object
                  console.log(
                    `ℹ️ User "${username}" already exists (race condition).`
                  );
                  createdUser = true;
                } else if (
                  err.code === "XX000" &&
                  err.message.includes("tuple concurrently updated")
                ) {
                  console.warn(
                    "⚠️ Tuple concurrently updated, retrying CREATE USER..."
                  );
                  userRetries--;
                  await new Promise((res) =>
                    setTimeout(res, HttpStatus.INTERNAL_SERVER_ERROR)
                  );
                } else {
                  throw err;
                }
              }
            }
            if (!createdUser) {
              throw new Error(
                `Failed to create user "${username}" after retries.`
              );
            }
          } else {
            console.log(`ℹ️ User "${username}" already exists.`);
          }

          console.log("🔐 Granting privileges...");
          await postgresDbClient.query(
            `GRANT CONNECT ON DATABASE "${dbName}" TO "${username}"`
          );

          console.log(
            "ℹ️ Connessione al database specifico per modificare lo schema public"
          );
          const serviceDbClient = new Client({
            ...postgresDbParams,
            user: postgresDbParams.username,
            database: dbName,
          });
          await serviceDbClient.connect();
          console.log(
            `✓ Connected to service database "${dbName}" as user "${username}"`
          );

          const queries = [
            'CREATE EXTENSION IF NOT EXISTS "pgcrypto"',
            'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
            `GRANT USAGE ON SCHEMA public TO "${username}"`,
            `GRANT CREATE ON SCHEMA public TO "${username}"`,
            `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "${username}"`,
            `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${username}"`,
          ];
          const tot = queries.length;
          console.log(`🔧 Executing ${tot} queries to set privileges...`);
          for (let i = 0; i < tot; i++) {
            console.log(`ready to execute query: ${queries[i]}`);
            await serviceDbClient.query(queries[i]);
            console.log(`${queries[i]} ${i + 1}/${tot} ✓`);
          }
          console.log("All queries executed ✓");

          await serviceDbClient.end();
        } catch (err) {
          console.error("✘ Error setting privileges:", err);
          throw err;
        } finally {
          await postgresDbClient.end();
        }

        const dataSourceOptions = {
          host: postgresDbParams.host,
          port: postgresDbParams.port || 5432,
          username: postgresDbParams.username,
          password: postgresDbParams.password,
          database: dbName,
        };

        try {
          const migrationPath = path.join(
            __dirname,
            "..",
            "migrations/*.{ts,js}"
          );
          console.log(`📦 migration path: ${migrationPath}`);
          const seedPath = path.join(__dirname, "..", "seeds");
          console.log(`📦 seed path: ${seedPath}`);

          const AppDataSource = new DikeDataSource({
            ...dataSourceOptions,
            type: "postgres",
            migrations: [migrationPath],
            seeds: [seedPath],
            synchronize: false,
          });

          await AppDataSource.initialize();
          console.log("📦 DataSource initialized.");

          const resultMigrations: Migration[] =
            await AppDataSource.runMigrations();
          if (resultMigrations.length === 0)
            console.log("there is no migration to be execute");
          else {
            console.log("✓ Migrations executed successfully:");
            resultMigrations.forEach((migration) =>
              console.log(`→ ${migration.name}`)
            );
          }

          const resultSeeds: Seed[] = await AppDataSource.runSeeds();
          if (resultSeeds.length === 0)
            console.log("there is no seeds to be execute");
          else {
            console.log("✓ Seeds executed successfully:");
            resultSeeds.forEach((seed) => console.log(`→ ${seed.name}`));
          }

          if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
          }
          console.log("🔌 DataSource closed.");
        } catch (error) {
          console.error("✘ Error during migration execution:", error);
          throw error;
        }

        return {
          ...dataSourceOptions,
          type: "postgres",
          entities: [EmailVerificationToken, LoginSession, WatchedPerson],
          // synchronize: process.env.NODE_ENV !== "production",
          synchronize: false,
          autoLoadEntities: true,
          logging: true,
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
