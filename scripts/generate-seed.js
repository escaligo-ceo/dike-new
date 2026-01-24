const fs = require("fs");
const path = require("path");

console.log("\x1b[35m[generate-seed][PARAMS]\x1b[0m process.argv:");
process.argv.forEach((arg, idx) => {
  console.log(`  [${idx}]: ${arg}`);
});

const serviceDir = process.cwd();
let seedName = null;
for (let i = 2; i < process.argv.length; i++) {
  if (!process.argv[i].startsWith("/")) {
    seedName = process.argv[i];
    break;
  }
}

if (!seedName) {
  console.error("Errore: manca il nome del seed come parametro.");
  console.error("Esempio: yarn seed:generate create-default-roles");
  process.exit(1);
}

const seedsDir = path.join(serviceDir, "src", "seeds");

const log = (msg) => console.log(`\x1b[36m[generate-seed]\x1b[0m ${msg}`);
const logSuccess = (msg) =>
  console.log(`\x1b[32m[generate-seed]\x1b[0m ${msg}`);
const logWarn = (msg) =>
  console.warn(`\x1b[33m[generate-seed][WARN]\x1b[0m ${msg}`);
const logError = (msg) =>
  console.error(`\x1b[31m[generate-seed][ERROR]\x1b[0m ${msg}`);

log(`Service directory: ${serviceDir}`);
log(`Seed name: ${seedName}`);
log(`Seeds directory: ${seedsDir}`);

if (!fs.existsSync(seedsDir)) {
  logWarn("La directory dei seed non esiste, la creo...");
  fs.mkdirSync(seedsDir, { recursive: true });
  logSuccess("Directory creata.");
} else {
  log("Directory dei seed già presente.");
}

const timestamp = new Date()
  .toISOString()
  .replace(/[-:TZ.]/g, "")
  .slice(0, 14);

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
const className = toPascalCase(seedName);
const fileBaseName = toKebabCase(seedName);
const fileName = `${timestamp}-${fileBaseName}.seed.ts`;
const filePath = path.join(seedsDir, fileName);

const fileContent = `import type { SeedInterface } from "@dike/common";
import { JobRole } from "@dike/common";
import { QueryRunner } from "typeorm";

export class ${className}${timestamp} implements SeedInterface {
  async run(queryRunner: QueryRunner): Promise<void> {
    // TODO: implementa il seed
  }
}
`;

fs.writeFileSync(filePath, fileContent);
logSuccess(`File di seed creato: ${fileName}`);
log(`Percorso completo: ${filePath}`);
log("Contenuto generato:");
console.log("---");
console.log(fileContent);
console.log("---");
logSuccess("Operazione completata con successo!");
