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

async function getLocalScannerArtifact(version) {
  const artifacts = await getArtifacts(version);

  return artifacts.filter((release) => release.name.endsWith(".zip"))[0];
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
  core.info(`Checking if ${CONTRAST_LOCAL_SCANNER} previously cached.`);

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
