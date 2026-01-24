const fs = require("fs");
const path = require("path");
const { Project } = require("ts-morph");

console.log("scan-routes avviato");
const OUTPUT_PATH = path.resolve(__dirname, "../resources/known-routes.json");
const showMethod = process.argv.includes("--ho-method");
const showVersion = process.argv.includes("--ho-version");
const showComment = process.argv.includes("--ho-comment");
const storeRoutes = process.argv.includes("--store-routes");

const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

const sourceFiles = project.getSourceFiles("**/*.controller.ts");
console.log(`numero di controller files: ${sourceFiles.length}`);

const routes = [];
if (sourceFiles.length === 0) {
  console.error(
    "Nessun file controller trovato. Assicurati che i file siano nominati *.controller.ts e inclusi nel tsconfig."
  );
}

for (const file of sourceFiles) {
  const controllers = file
    .getClasses()
    .filter((cls) => cls.getDecorator("Controller"));
  controllers.forEach((controller) => {
    // Gestione decoratore Controller
    let basePath = "";
    let controllerVersion = "";
    const controllerDecorator = controller.getDecorator("Controller");
    if (controllerDecorator) {
      const arg = controllerDecorator.getArguments()[0];
      if (arg) {
        if (arg.getKindName && arg.getKindName() === "StringLiteral") {
          basePath = arg.getText().replace(/['"`]/g, "");
        } else if (
          arg.getKindName &&
          arg.getKindName() === "ObjectLiteralExpression"
        ) {
          // Estrai path e version dall'oggetto
          const pathProp = arg.getProperty("path");
          if (pathProp && pathProp.getInitializer) {
            basePath = pathProp
              .getInitializer()
              .getText()
              .replace(/['"`]/g, "");
          }
          const versionProp = arg.getProperty("version");
          if (versionProp && versionProp.getInitializer) {
            controllerVersion = versionProp
              .getInitializer()
              .getText()
              .replace(/['"`]/g, "");
          }
        }
      }
    }
    const methods = controller.getMethods();
    console.log(`\nController: ${file.getFilePath()}`);
    console.log(`  Base path: /${basePath}`);
    let foundRoute = false;
    methods.forEach((method) => {
      const routeDecorator = method
        .getDecorators()
        .find((d) =>
          ["Get", "Post", "Put", "Delete", "Patch"].includes(d.getName())
        );
      if (routeDecorator) {
        foundRoute = true;
        const methodPath =
          routeDecorator.getArguments()[0]?.getText().replace(/['"`]/g, "") ??
          "";
        const httpMethod = routeDecorator.getName().toUpperCase();
        // Version: priorità decoratore Version, altrimenti quella del controller
        let version = controllerVersion;
        const versionDecorator = method.getDecorator("Version");
        if (versionDecorator) {
          version =
            versionDecorator
              .getArguments()[0]
              ?.getText()
              .replace(/['"`]/g, "") ?? controllerVersion;
        }
        // Commento
        let comment = "";
        const apiOpDecorator = method.getDecorator("ApiOperation");
        if (apiOpDecorator) {
          const arg = apiOpDecorator.getArguments()[0];
          if (arg && arg.getText) {
            try {
              const obj = eval("(" + arg.getText() + ")");
              comment = obj.summary || "";
            } catch (e) {
              comment = "";
            }
          }
        }
        const pathStr = `/${basePath}/${methodPath}`
          .replace(/\/+/g, "/")
          .replace(/\/$/, "");
        let output = `  [${httpMethod}] ${pathStr}`;
        if (version) output += ` | version: ${version}`;
        if (comment) output += ` | comment: ${comment}`;
        if (showMethod) output += " | ho-method";
        if (showVersion) output += " | ho-version";
        if (showComment) output += " | ho-comment";
        console.log(output);
        routes.push(output);
      }
    });
    if (!foundRoute) {
      console.log("  Nessuna rotta trovata.");
    }
  });
}

if (storeRoutes) {
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(routes, null, 2));
  console.log(`✓ Rotte salvate in: ${OUTPUT_PATH}`);
}
