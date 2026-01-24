#!/usr/bin/env node
// scripts/print-routes.js
// Stampa tutte le rotte dei controller NestJS del servizio corrente

const path = require("path");
const fs = require("fs");

const controllersDir = path.join(process.cwd(), "src");

function findControllers(dir) {
  let controllers = [];
  if (!fs.existsSync(dir)) return controllers;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      controllers = controllers.concat(findControllers(fullPath));
    } else if (
      file.endsWith("controller.js") ||
      file.endsWith("controller.ts")
    ) {
      controllers.push(fullPath);
    }
  }
  return controllers;
}

function extractRoutesFromFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  // Trova il path del controller
  const controllerMatch = content.match(/@Controller\((['"])(.*?)\1\)/);
  const controllerPath = controllerMatch ? controllerMatch[2] : "";
  // Trova tutte le rotte
  const routeRegex = /@(Get|Post|Put|Delete|Patch)\((['"])(.*?)\2\)/g;
  let match;
  const routes = [];
  while ((match = routeRegex.exec(content)) !== null) {
    routes.push({ method: match[1].toUpperCase(), path: match[3] });
  }
  return { filePath, controllerPath, routes };
}

const controllers = findControllers(controllersDir);
if (controllers.length === 0) {
  console.log("Nessun controller trovato in src");
  process.exit(0);
}

controllers.forEach((controllerFile) => {
  const { filePath, controllerPath, routes } =
    extractRoutesFromFile(controllerFile);
  console.log(`\nController: ${filePath}`);
  console.log(`  Base path: /${controllerPath}`);
  if (routes.length === 0) {
    console.log("  Nessuna rotta trovata.");
  } else {
    routes.forEach((r) => {
      console.log(`  [${r.method}] /${controllerPath}/${r.path}`);
    });
  }
});
