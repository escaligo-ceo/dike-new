const fs = require("fs");
const path = require("path");

// Stampa tutti i parametri passati
console.log("\x1b[35m[generate-migration][PARAMS]\x1b[0m process.argv:");
process.argv.forEach((arg, idx) => {
  console.log(`  [${idx}]: ${arg}`);
});

const serviceDir = process.cwd();
// Trova il primo argomento che non sia un path assoluto (nome migrazione)
let migrationName = null;
for (let i = 2; i < process.argv.length; i++) {
  if (!process.argv[i].startsWith("/")) {
    migrationName = process.argv[i];
    break;
  }
}

if (!migrationName) {
  console.error("Errore: manca il nome della migrazione come parametro.");
  console.error("Esempio: yarn migration:generate create-login-sessions");
  process.exit(1);
}

const migrationsDir = path.join(serviceDir, "src", "migrations");

// Logging helper
const log = (msg) => console.log(`\x1b[36m[generate-migration]\x1b[0m ${msg}`);
const logSuccess = (msg) =>
  console.log(`\x1b[32m[generate-migration]\x1b[0m ${msg}`);
const logWarn = (msg) =>
  console.warn(`\x1b[33m[generate-migration][WARN]\x1b[0m ${msg}`);
const logError = (msg) =>
  console.error(`\x1b[31m[generate-migration][ERROR]\x1b[0m ${msg}`);

log(`Service directory: ${serviceDir}`);
log(`Migration name: ${migrationName}`);
log(`Migrations directory: ${migrationsDir}`);

// Crea la directory se non esiste
if (!fs.existsSync(migrationsDir)) {
  logWarn("La directory delle migration non esiste, la creo...");
  fs.mkdirSync(migrationsDir, { recursive: true });
  logSuccess("Directory creata.");
} else {
  log("Directory delle migration già presente.");
}

const timestamp = new Date()
  .toISOString()
  .replace(/[-:TZ.]/g, "")
  .slice(0, 14);

// Converte il nome migrationName in kebab-case per il file e PascalCase per la classe
function toPascalCase(str) {
  return str
    .replace(/[-_]+/g, " ")
    .replace(/(?:^|\s)(\w)/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/\s+/g, "");
}
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}
const className = toPascalCase(migrationName);
const fileBaseName = toKebabCase(migrationName);
const fileName = `${timestamp}-${fileBaseName}.ts`;
const filePath = path.join(migrationsDir, fileName);

// Contenuto base della migrazione
const fileContent = `import { MigrationInterface, QueryRunner } from "typeorm";

export class ${className}${timestamp} implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // TODO: scrivi qui la logica per applicare la migrazione
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // TODO: scrivi qui la logica per annullare la migrazione
  }
}
`;

fs.writeFileSync(filePath, fileContent);
logSuccess(`File di migration creato: ${fileName}`);
log(`Percorso completo: ${filePath}`);
log("Contenuto generato:");
console.log("---");
console.log(fileContent);
console.log("---");
logSuccess("Operazione completata con successo!");
