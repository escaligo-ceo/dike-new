import fs from "fs";
import path from "path";
import { DataSource, DataSourceOptions, MixedList } from "typeorm";
import { Seed } from "./seed.js";

export type DikeConnectionOptions = DataSourceOptions & {
  /**
   * Seeds to be loaded for this connection.
   * Accepts both seed classes and glob patterns representing seed files.
   */
  readonly seeds?: MixedList<Function | string>;
};

export class DikeDataSource extends DataSource {
  private readonly seeds?: MixedList<Function | string>;
  private seedFiles: string[] = [];

  constructor(options: DikeConnectionOptions) {
    const { seeds, ...restOptions } = options;
    super(restOptions as DataSourceOptions);
    this.seeds = seeds;

    // Preload seed files from provided directory path (first string entry in seeds)
    const firstSeed = Array.isArray(this.seeds) ? this.seeds[0] : this.seeds;
    const seedPath = typeof firstSeed === "string" ? firstSeed : undefined;
    if (seedPath && fs.existsSync(seedPath)) {
      this.seedFiles = fs
        .readdirSync(seedPath)
        .filter((f) => /\.seed\.(ts|js)$/.test(f) && !f.endsWith(".d.ts"))
        .sort()
        .map((f) => path.join(seedPath, f));
    }
  }

  public initialize() {
    return super.initialize();
  }

  isIstantiated(): boolean {
    return this.isInitialized;
  }

  public runMigrations() {
    return super.runMigrations();
  }

  public runSeeds = async (): Promise<Seed[]> => {
    const res: Seed[] = [];
    // Use preloaded seed files from constructor
    if (!this.seedFiles || this.seedFiles.length === 0) {
      // console.warn("Nessun percorso seeds fornito (string expected).");
      return res;
    }
    const files = this.seedFiles;
    if (files.length === 0) {
      console.log("Nessun file di seed trovato.");
    } else {
      if (!this.isInitialized) {
        await this.initialize();
      }
      // Tabella di tracking
      await this.query(
        'CREATE TABLE IF NOT EXISTS "seeds" ("id" serial PRIMARY KEY, "timestamp" bigint NOT NULL, "name" varchar(255) NOT NULL, "run_on" timestamptz NOT NULL DEFAULT now());'
      );
      const executedSeeds = await this.query('SELECT name FROM "seeds";');
      const executedNames = new Set(executedSeeds.map((s: any) => s.name));
      for (const file of files) {
        if (executedNames.has(file)) {
          // console.log(`Seed già eseguito, salto: ${file}`);
          continue;
        }
        const seedFilename = file;
        // console.log(seedFilename);
        let seedModule: any;
        try {
          seedModule = await import(seedFilename);
        } catch (e) {
          // Fallback to CommonJS require for modules compiled to CJS
          try {
            // Use CommonJS require via eval to avoid import.meta in CJS builds
            const req = eval("require") as NodeRequire;
            seedModule = req(seedFilename);
          } catch (e2) {
            console.warn(`Impossibile importare il seed ${file}:`, e2);
            continue;
          }
        }

        // Resolve exported seed: prefer default, otherwise first exported member
        let exported: any = seedModule?.default ?? seedModule;
        if (
          !exported ||
          (exported && typeof exported === "object" && !exported.run)
        ) {
          const keys = Object.keys(seedModule || {}).filter(
            (k) => k !== "__esModule"
          );
          // Prefer any export that is a function/class or has a run()
          const candidateKey =
            keys.find((k) => {
              const v = (seedModule as any)[k];
              return (
                typeof v === "function" ||
                (typeof v === "object" &&
                  v !== null &&
                  typeof v.run === "function")
              );
            }) || keys[0];
          if (candidateKey) exported = (seedModule as any)[candidateKey];
        }

        if (!exported) {
          console.warn(
            `File seed ${file} non esporta nulla (default o nominato), ignorato.`
          );
          continue;
        }

        // If exported is a class (constructor) with run on prototype -> instantiate and run
        if (
          typeof exported === "function" &&
          exported.prototype &&
          // Classe che implementa un metodo run (SeedInterface-like)
          typeof exported.prototype.run === "function"
        ) {
          const instance = new exported();
          if (typeof instance.run === "function") {
            // console.log(`Eseguo seed (classe): ${file}`);
            // Prova ad invocare con DataSource (this). Se fallisce, tenta con QueryRunner.
            try {
              await instance.run(this as any);

              const className = exported.name;
              // console.log(`→ ${className}`);
              res.push(exported);
            } catch (err) {
              try {
                const qr = this.createQueryRunner();
                await instance.run(qr as any);
                res.push(instance);
              } catch (err2) {
                console.error(
                  `✘ Errore eseguendo seed (classe) ${file}:`,
                  err2
                );
                throw err2;
              }
            }
          } else {
            console.warn(
              `File seed ${file}: la classe non implementa run, ignorato.`
            );
          }
        }
        // If exported is an object with run()
        else if (
          typeof exported === "object" &&
          exported !== null &&
          typeof (exported as any).run === "function"
        ) {
          console.log(`Eseguo seed (oggetto.run): ${file}`);
          await exported.run(this);
          res.push(exported);
        } else {
          // If exported is a function (seed as function)
          if (typeof exported === "function") {
            // Alcuni transpiler possono perdere il prototype.run: tenta instanza e verifica
            try {
              const maybeInstance = new (exported as any)();
              if (maybeInstance && typeof maybeInstance.run === "function") {
                console.log(`Eseguo seed (classe - fallback): ${file}`);
                try {
                  await maybeInstance.run(this as any);
                  res.push(maybeInstance);
                } catch {
                  const qr = this.createQueryRunner();
                  await maybeInstance.run(qr as any);
                  res.push(maybeInstance);
                }
              } else {
                console.log(`Eseguo seed (funzione): ${file}`);
                await (exported as any)(this);
                res.push(exported);
              }
            } catch {
              console.log(`Eseguo seed (funzione): ${file}`);
              await (exported as any)(this);
              res.push(exported);
            }
          } else {
            console.warn(
              `File seed ${file} non esporta una classe/funzione/run utilizzabile, ignorato.`
            );
            continue;
          }
        }

        const timestamp = Date.now();
        await this.query(
          'INSERT INTO "seeds" ("timestamp", "name") VALUES ($1, $2);',
          [timestamp, res[res.length - 1].name || file]
        );
      }
      if (this.isInitialized) {
        await this.destroy();
      }
      // console.log("Seeding completato!");
    }
    return res;
  };
}
