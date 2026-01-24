function getStagedFiles() {
  try {
    const output = execSync("git diff --cached --name-only", {
      encoding: "utf-8",
    });
    return output.trim().split("\n");
  } catch (e) {
    throw e;
  }
}

function hasStagedFiles() {
  try {
    const stagedFiles = getStagedFiles();
    if (!stagedFiles || stagedFiles.length === 0) {
      return false;
    }
    // conto i file staged con nome diverso da ''

    let notEmptyFilenameCount = 0;
    for (let i = 0; i < stagedFiles.length; i++) {
      if (stagedFiles[i] !== "") {
        return true;
      }
    }
    return false;
  } catch (e) {
    throw e;
  }
}

// Funzione che aggiorna i file di versionamento (package.json, .env*, CHANGELOG.md)
function updateVersionFiles(projectDir, newVersion, message) {
  updateVersion(projectDir, newVersion);
  console.error(`✅ message ${message}`);
  if (typeof message === "string") {
    updateChangelog(projectDir, newVersion, message);
  }
}
const readline = require("readline");
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Determina la cartella base (apps, scripts, docs, doc)
const getBaseFolder = (cwd, projectDir) => {
  const normCwd = cwd.replace(/\\/g, "/");
  const normProj = projectDir.replace(/\\/g, "/");
  if (normCwd.includes("/apps") || normProj.includes("/apps")) return "apps";
  if (normCwd.includes("/scripts") || normProj.includes("/scripts"))
    return "scripts";
  if (normCwd.includes("/docs") || normProj.includes("/docs")) return "docs";
  return null;
};

// Funzione per aggiornare la versione nel package.json e nei file .env
const updateVersion = (projectDir, version) => {
  const packageJsonPath = path.join(projectDir, "package.json");
  const packageJson = require(packageJsonPath);

  packageJson.version = version;

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2) + "\n"
  );
  console.log(`✅ Updated version in package.json to ${version}`);

  // Trova tutti i file .env nella cartella specificata
  const envFiles = fs
    .readdirSync(projectDir)
    .filter((file) => file.startsWith(".env"));

  console.log(`📂 Found ${envFiles.length} .env file(s) in ${projectDir}`);
  const isLibrary = envFiles.length === 0;

  if (!isLibrary) {
    console.log("Updating VERSION in .env files");
    envFiles.forEach((file) => {
      const envFilePath = path.join(projectDir, file);
      let envContent = fs.readFileSync(envFilePath, "utf-8");

      const replaceOrAppend = (content, key) => {
        const regex = new RegExp(`^${key}=.*$`, "m");
        if (regex.test(content)) {
          return content.replace(regex, `${key}=${version}`);
        } else {
          return `${content.trim()}\n${key}=${version}\n`;
        }
      };

      envContent = replaceOrAppend(envContent, "VERSION");

      fs.writeFileSync(envFilePath, envContent);
      console.log(`📦 Updated VERSION in ${file}`);
    });
  }
};

function updateServiceVersionInDockerCompose(serviceName, newVersion) {
  const dockerComposePath = path.resolve(__dirname, "../docker-compose.yaml");
  let content = fs.readFileSync(dockerComposePath, "utf8");

  // Trova la sezione del servizio e aggiorna VERSION nella environment
  const serviceBlockRegex = new RegExp(
    `(${serviceName}:\\s*[\\s\\S]*?environment:\\s*)([\\s\\S]*?)(\\n\\s*\\w+:|\\n\\s*[a-zA-Z_-]+:|\\n\\s*$)`,
    "m"
  );
  const match = content.match(serviceBlockRegex);
  if (match) {
    let envBlock = match[2];
    // Cerca la riga VERSION: e la aggiorna, oppure la aggiunge se non esiste
    if (/VERSION:\s*[^\n]+/.test(envBlock)) {
      envBlock = envBlock.replace(/(VERSION:\s*)([^\n]+)/, `$1${newVersion}`);
    } else {
      envBlock = `VERSION: ${newVersion}\n${envBlock}`;
    }
    content = content.replace(serviceBlockRegex, `$1${envBlock}$3`);
    fs.writeFileSync(dockerComposePath, content, "utf8");
    console.log(
      `docker-compose.yaml updated: ${serviceName} VERSION=${newVersion}`
    );
  } else {
    console.warn(
      `⚠️ environment section not found for ${serviceName} in docker-compose.yaml`
    );
  }
}

function updateServiceVersionInEnv(serviceName, newVersion) {
  // Rimuovi suffisso "-service" se presente
  if (serviceName.endsWith("-service")) {
    serviceName = serviceName.slice(0, -8);
  }
  const envDir = path.resolve(__dirname, "../");
  // Prende tutti i file .env* nella root
  const envFiles = fs.readdirSync(envDir).filter((f) => f.startsWith(".env"));
  const envVar = `${serviceName.replace(/-/g, "_").toUpperCase()}_VERSION`;

  envFiles.forEach((envFile) => {
    const envPath = path.join(envDir, envFile);
    let content = fs.readFileSync(envPath, "utf8");
    const regex = new RegExp(`^${envVar}=.*$`, "m");
    if (regex.test(content)) {
      content = content.replace(regex, `${envVar}=${newVersion}`);
      fs.writeFileSync(envPath, content, "utf8");
      console.log(`📦 Updated ${envVar} in /${envFile}`);
    } else {
      content += `\n${envVar}=${newVersion}\n`;
      fs.writeFileSync(envPath, content, "utf8");
      console.log(`📦 Updated ${envVar} in /${envFile} (added)`);
    }
  });
}

const parseArgs = () => {
  const args = process.argv.slice(2);
  let releaseType = args[0];
  let projectDir;
  let value;
  let message = undefined;
  let dirIndex = -1;

  // Default parametri
  let autoCommit = true;
  let autoRollback = false;

  // Parsing parametri booleani
  // --no-auto-commit ha priorità su --auto-commit
  let noAutoCommit = args.includes("--no-auto-commit");
  args.forEach((arg) => {
    if (arg.startsWith("--auto-commit")) {
      const val = arg.split("=")[1];
      if (val === "false") autoCommit = false;
      if (val === "true") autoCommit = true;
    }
    if (arg.startsWith("--auto-rollback")) {
      const val = arg.split("=")[1];
      if (val === "true") autoRollback = true;
      if (val === "false") autoRollback = false;
    }
  });
  if (noAutoCommit) autoCommit = false;

  // Se il primo argomento è un tipo valido, usalo, altrimenti default a patch
  if (!["major", "minor", "patch", "custom"].includes(releaseType)) {
    releaseType = "patch";
    projectDir = args[0] && !args[0].startsWith("-") ? args[0] : undefined;
    dirIndex = projectDir ? 0 : -1;
  } else {
    // Trova la directory: primo argomento dopo tipo che non inizia con '-'
    for (let i = 1; i < args.length; i++) {
      if (!args[i].startsWith("-")) {
        projectDir = args[i];
        dirIndex = i;
        break;
      }
    }
  }
  if (!projectDir) {
    projectDir = process.cwd();
    dirIndex = 0;
  }
  // Considera tutti i parametri dopo la directory (inclusi -m e messaggio)
  const extraArgs = args.slice(dirIndex + 1);
  const mIndex = extraArgs.findIndex((arg) => arg === "-m");
  if (mIndex !== -1 && extraArgs[mIndex + 1]) {
    message = extraArgs[mIndex + 1];
  }
  switch (releaseType) {
    case "custom":
      value = args[2];
      break;
    case "major":
    case "minor":
    case "patch":
      break;
    default:
      console.error(
        `❌ Invalid release type: ${releaseType}. Use: major | minor | patch | custom`
      );
      process.exit(1);
  }
  return {
    releaseType,
    customVersion: value,
    message,
    projectDir,
    autoCommit,
    autoRollback,
  };
};

const incrementVersion = (releaseType, version) => {
  const parts = version.split(".");
  switch (releaseType) {
    case "major":
      parts[0] = (parseInt(parts[0], 10) + 1).toString();
      parts[1] = "0";
      parts[2] = "0";
      break;
    case "minor":
      parts[1] = (parseInt(parts[1], 10) + 1).toString();
      parts[2] = "0";
      break;
    case "patch":
      parts[2] = (parseInt(parts[2], 10) + 1).toString();
      break;
    case "custom":
      parts[2] = version;
      break;
    default:
      throw new Error("Unknown release type");
  }
  return parts.join(".");
};

const updateChangelog = (projectDir, newVersion, message) => {
  const changelogPath = path.join(projectDir, "CHANGELOG.md");
  const date = new Date().toISOString().split("T")[0];

  let changelogContent = "";
  if (fs.existsSync(changelogPath)) {
    changelogContent = fs.readFileSync(changelogPath, "utf-8");
  } else {
    changelogContent = "# Changelog";
  }

  const newEntry = `\n\n## [${newVersion}] - ${date}\n${message ? `\n- ${message}` : ""}`;
  changelogContent += newEntry;
  fs.writeFileSync(changelogPath, changelogContent);
  console.log(`📝 CHANGELOG.md updated for version ${newVersion}`);
};

async function main() {
  const {
    releaseType,
    customVersion,
    message,
    projectDir,
    autoCommit,
    autoRollback,
  } = parseArgs();

  if (
    releaseType === "custom" &&
    (!customVersion || customVersion === null || customVersion === undefined)
  ) {
    console.error("❌ Custom version type requires a version value.");
    process.exit(1);
  }

  if (!["major", "minor", "patch", "custom"].includes(releaseType)) {
    console.error(
      `❌ Invalid argument ${releaseType}. Use: major | minor | patch | custom instead`
    );
    process.exit(1);
  }

  if (!fs.existsSync(projectDir)) {
    console.error(`❌ Project directory "${projectDir}" does not exist.`);
    process.exit(1);
  }

  const packageJsonPath = path.join(projectDir, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    console.error(`❌ package.json not found in "${projectDir}"`);
    process.exit(1);
  }

  const packageJson = require(packageJsonPath);
  const currentVersion = packageJson.version;

  newVersion =
    releaseType === "custom"
      ? customVersion
      : incrementVersion(releaseType, currentVersion);

  // Also bump the root (global dike) version using same release type
  const rootDir = path.resolve(__dirname, "../");
  const rootPackageJsonPath = path.join(rootDir, "package.json");
  if (!fs.existsSync(rootPackageJsonPath)) {
    console.error(`❌ package.json not found in root directory`);
    process.exit(1);
  }
  const rootPackageJson = require(rootPackageJsonPath);
  const rootCurrentVersion = rootPackageJson.version;
  const rootNewVersion =
    releaseType === "custom"
      ? customVersion
      : incrementVersion(releaseType, rootCurrentVersion);

  // Esegui solo se tutto è andato a buon fine
  try {
    let stagedFile = getStagedFiles();
    // Aggiorna i file di versione solo se ci sono file in staging
    if (!hasStagedFiles()) {
      console.error("❌ No files in staging: no commit will be performed.");
      process.exit(1);
    }
    updateVersionFiles(projectDir, newVersion, message);
    // Update global version (root package.json, root .env*, root CHANGELOG)
    updateVersionFiles(rootDir, rootNewVersion, message);
    console.log("The following files will be added to the commit:");
    stagedFile.forEach((f) => console.log("  -", f));

    // Usa sempre la posizione fisica dello script come riferimento per scripts/
    const scriptDir = __dirname;
    const cwd = scriptDir;
    // const cwd = process.env.PWD || process.cwd();
    const baseFolder = getBaseFolder(cwd, projectDir);

    // Determinazione robusta del nome servizio per il tag
    let serviceName = path.basename(projectDir);
    const normPath = projectDir.replace(/\\/g, "/");
    if (/apps\/backend\//.test(normPath)) {
      const match = normPath.match(/apps\/backend\/([^\/]+)/);
      if (match) serviceName = match[1];
    } else if (/apps\/frontend\//.test(normPath)) {
      const match = normPath.match(/apps\/frontend\/([^\/]+)/);
      if (match) serviceName = match[1];
    } else if (/libs\//.test(normPath)) {
      const match = normPath.match(/libs\/([^\/]+)/);
      if (match) serviceName = match[1];
    } else if (/\/scripts(\/|$)/.test(normPath)) {
      serviceName = "scripts";
    } else if (/\/docs(\/|$)/.test(normPath)) {
      serviceName = "docs";
    } else {
      // fallback: nome della directory
      serviceName = path.basename(projectDir);
    }

    // updateServiceVersionInDockerCompose(serviceName, newVersion);
    updateServiceVersionInEnv(serviceName, newVersion);

    // Trova solo i file di versione nella cartella di lavoro (projectDir)
    let versionFiles = [
      "package.json",
      "CHANGELOG.md",
      ...fs
        .readdirSync(projectDir)
        .filter(
          (f) =>
            f.startsWith(".env") || f === "env.example" || f === ".env.example"
        ),
    ]
      .map((f) => path.join(projectDir, f))
      .filter((f) => fs.existsSync(f));

    // Trova solo i file di versione nella cartella di lavoro (projectDir)
    versionFiles = [
      // Service-specific files
      path.join(projectDir, "package.json"),
      path.join(projectDir, "CHANGELOG.md"),
      ...fs
        .readdirSync(projectDir)
        .filter(
          (f) =>
            f.startsWith(".env") || f === "env.example" || f === ".env.example"
        )
        .map((f) => path.join(projectDir, f))
        .filter((f) => fs.existsSync(f)),
      // Root/global files
      path.join(rootDir, "package.json"),
      path.join(rootDir, "CHANGELOG.md"),
      ...fs
        .readdirSync(rootDir)
        .filter(
          (f) =>
            f.startsWith(".env") || f === "env.example" || f === ".env.example"
        )
        .map((f) => path.join(rootDir, f))
        .filter((f) => fs.existsSync(f)),
    ];

    const checkIgnoreCmd = `git check-ignore ${versionFiles
      .map((f) => '"' + f + '"')
      .join(" ")}`;
    let ignored = [];
    try {
      ignored = execSync(checkIgnoreCmd, { encoding: "utf-8" })
        .split("\n")
        .map(function (s) {
          return s.trim();
        })
        .filter(function (s) {
          return s.length > 0;
        });
    } catch (e) {
      // Se git check-ignore non trova file ignorati, esce con code 1: va bene
      ignored = [];
    }
    versionFiles = versionFiles.filter((f) => !ignored.includes(f));

    console.log("The following versioning files will be added to the commit:");
    versionFiles.forEach((f) => console.log("  -", f));

    // git add solo dei file di versione non ignorati
    execSync(`git add ${versionFiles.map((f) => '"' + f + '"').join(" ")}`, {
      stdio: "inherit",
    });

    const tagName = `${serviceName}-v${newVersion}`;
    console.log(`ℹ️  Tag name: ${tagName}`);
    if (!autoCommit) {
      // chiede all'utente se preocedere
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const answer = await new Promise((resolve) => {
        rl.question(
          "Auto commit is disabled.\nDo you want to proceed manually with the commit? (y/N): ",
          (ans) => {
            rl.close();
            resolve(ans.trim().toLowerCase());
          }
        );
      });
      if (answer !== "y" && answer !== "yes") {
        // Ripristina i file di versione modificati
        versionFiles.forEach((file) => {
          try {
            execSync(`git restore "${file}"`);
            console.log(`🔄 Restored ${file}`);
          } catch (e) {
            console.error(`❌ Error restoring ${file}:`, e.message);
          }
        });
        console.error("❌  Operation cancelled by user.");
        process.exit(1);
      }
    }
    if (autoCommit) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      const answer = await new Promise((resolve) => {
        rl.question(
          "Auto commit is disabled (--no-auto-commit). Do you want to proceed manually with the commit? (y/N): ",
          (ans) => {
            rl.close();
            resolve(ans.trim().toLowerCase());
          }
        );
      });
      if (answer !== "y" && answer !== "yes") {
        // Ripristina i file di versione modificati
        versionFiles.forEach((file) => {
          try {
            execSync(`git restore --staged "${file}"`);
            execSync(`git checkout -- "${file}"`);
            console.log(`🔄 Restored ${file}`);
          } catch (e) {
            console.error(`❌ Error restoring ${file}:`, e.message);
          }
        });
        console.error("❌  Operation cancelled by user.");
        process.exit(1);
      }
    }
    execSync(`git commit -m "${tagName}"`, { stdio: "inherit" });
    execSync(`git tag ${tagName}`, { stdio: "inherit" });
    console.log(`✅ Commit and tag ${tagName} created.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error while preparing files:", err);
    process.exit(1);
  }
}

main();
