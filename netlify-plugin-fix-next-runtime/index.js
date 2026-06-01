const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const patchConstantsFile = (constantsPath) => {
  const source = fs.readFileSync(constantsPath, "utf8");
  const patched = source.replace(
    'var PLUGIN_DIR = resolve(`${MODULE_DIR}../../..`);',
    'var PLUGIN_DIR = process.env.LAMBDA_TASK_ROOT || resolve(`${MODULE_DIR}../../..`);'
  );

  if (patched !== source) {
    fs.writeFileSync(constantsPath, patched);
    console.log(`Patched Netlify Next runtime constants at ${constantsPath}`);
  }
};

const findConstantsPath = (constants) => {
  const relativePath = path.join(
    ".netlify",
    "functions-internal",
    "___netlify-server-handler",
    ".netlify",
    "dist",
    "run",
    "constants.js"
  );

  return [
    path.join(process.cwd(), relativePath),
    path.join(constants.PUBLISH_DIR, "..", relativePath),
  ].find((candidate) => fs.existsSync(candidate));
};

const patchFunctionZip = () => {
  const zipPath = path.join(
    process.cwd(),
    ".netlify",
    "functions",
    "___netlify-server-handler.zip"
  );

  if (!fs.existsSync(zipPath)) {
    console.log(`Netlify Next runtime zip not found at ${zipPath}`);
    return;
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "kuma-netlify-fn-"));

  try {
    execFileSync("unzip", ["-q", zipPath, "-d", tempDir]);
    const constantsPath = path.join(
      tempDir,
      ".netlify",
      "dist",
      "run",
      "constants.js"
    );

    if (fs.existsSync(constantsPath)) {
      patchConstantsFile(constantsPath);
      execFileSync("zip", ["-qr", zipPath, "."], { cwd: tempDir });
      console.log(`Patched Netlify Next runtime function zip at ${zipPath}`);
    } else {
      console.log(`Netlify Next runtime constants not found inside ${zipPath}`);
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

module.exports = {
  onBuild({ constants }) {
    const constantsPath = findConstantsPath(constants);
    if (constantsPath) {
      patchConstantsFile(constantsPath);
    }
  },
  onPostBuild({ constants }) {
    const constantsPath = findConstantsPath(constants);
    if (constantsPath) {
      patchConstantsFile(constantsPath);
    }
    patchFunctionZip();
  },
};
