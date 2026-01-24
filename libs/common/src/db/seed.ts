import { QueryRunner } from "typeorm";

/**
 * Migrations should implement this interface and all its methods.
 */
export interface SeedInterface {
    /**
     * Optional seed name, defaults to class name.
     */
    name?: string;
    /**
     * Optional flag to determine whether to run the seed in a transaction or not.
     * Can only be used when `migrationsTransactionMode` is either "each" or "none"
     * Defaults to `true` when `migrationsTransactionMode` is "each"
     * Defaults to `false` when `migrationsTransactionMode` is "none"
     */
    transaction?: boolean;
    /**
     * Run the seeds.
     */
    run(queryRunner: QueryRunner): Promise<any>;
}

/**
 * Represents entity of the seed in the database.
 */
export declare class Seed {
    /**
     * Seed id.
     * Indicates order of the executed seeds.
     */
    id: number | undefined;
    /**
     * Timestamp of the seed.
     */
    timestamp: number;
    /**
     * Name of the seed (class name).
     */
    name: string;
    /**
     * Seed instance that needs to be run.
     */
    instance?: SeedInterface;
    /**
     * Whether to run this seed within a transaction
     */
    transaction?: boolean;
    constructor(id: number | undefined, timestamp: number, name: string, instance?: SeedInterface, transaction?: boolean);
}