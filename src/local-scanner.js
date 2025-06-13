const tc = require("@actions/tool-cache");
const cache = require("@actions/cache");
const core = require("@actions/core");
const fs = require("fs");
const path = require("path");
const getArtifacts = require("./artifacts");
const { localScannerVersion } = require("./config");

const CONTRAST_LOCAL_SCANNER = "contrast-local-scanner";
const LOCAL_SCANNER_PATH = `${process.env.HOME}/${CONTRAST_LOCAL_SCANNER}`;
const LOCAL_SCANNER_CACHE_KEY = `${CONTRAST_LOCAL_SCANNER}-${localScannerVersion}`;
const JAR_NAME = `sast-local-scan-runner-${localScannerVersion}.jar`;
const JAR_FULL_PATH = path.join(LOCAL_SCANNER_PATH, JAR_NAME);

async function getLocalScannerArtifact(version) {
  const artifacts = await getArtifacts(version);

  if (artifacts && artifacts.length > 0) {
    const zipArtifacts = artifacts.filter((release) => release.name.endsWith(".zip"));

    if (zipArtifacts && zipArtifacts.length > 0) return zipArtifacts[0];
  }

  throw new Error(`Unable to download local scanner ${version} artifact`);
}

const getLocalScannerLocation = (directory) => {
  const releaseDir = fs.readdirSync(directory);

  const jarLocations = releaseDir.filter((file) => file.endsWith(".jar"));

  if (jarLocations.length === 1) {
    return path.join(directory, jarLocations[0]);
  }

  throw new Error(`Unable to locate ${CONTRAST_LOCAL_SCANNER} jar`);
};

async function restoreCache() {
  return cache.restoreCache([LOCAL_SCANNER_PATH], LOCAL_SCANNER_CACHE_KEY);
}

async function saveCache() {
  const cacheId = await cache.saveCache(
    [LOCAL_SCANNER_PATH],
    LOCAL_SCANNER_CACHE_KEY,
  );

  core.info(`Cache saved with id ${cacheId}`);
}

async function getLocalScannerPath() {

  if (fs.existsSync(JAR_FULL_PATH)) {
    core.info(`${CONTRAST_LOCAL_SCANNER} exists locally`);
    return JAR_FULL_PATH;
  }

  core.info(`${JAR_FULL_PATH} not found locally, checking if exists in cache.`);

  const cacheKey = await restoreCache();

  if (!cacheKey) {
    core.info(`${CONTRAST_LOCAL_SCANNER} not previously cached, downloading.`);

    const localScannerArtifact =
      await getLocalScannerArtifact(localScannerVersion);

    const downloadPath = await tc.downloadTool(localScannerArtifact.url);

    core.info(`${CONTRAST_LOCAL_SCANNER} downloaded to ${downloadPath}.`);

    const extractDirectory = await tc.extractZip(
      downloadPath,
      LOCAL_SCANNER_PATH,
    );

    core.info(`${CONTRAST_LOCAL_SCANNER} extracted to ${extractDirectory}.`);

    await saveCache();
  }

  return getLocalScannerLocation(LOCAL_SCANNER_PATH);
}

module.exports = getLocalScannerPath;
