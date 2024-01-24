const core = require("@actions/core");
const getLocalScannerPath = require("./local-scanner");
const scan = require("./scan");
const { startCheck, finishCheck } = require("./checks");
const { checks, title, severity, strategy } = require("./config");

async function runScan() {
  core.info(`Running ${title}`);

  const localScannerJar = await getLocalScannerPath();

  const scanDetails = await scan(localScannerJar);

  if (severity && scanDetails.thresholdResults > 0) {
    core.setFailed(
      `Found ${scanDetails.thresholdResults} open results at ${strategy} level with severity ${severity} or higher.`,
    );
  }

  core.setOutput("scanDetails", scanDetails);

  return scanDetails;
}

async function runScanWithChecks() {
  let scanDetails;

  try {
    await startCheck();

    scanDetails = await runScan();

    core.debug(JSON.stringify(scanDetails, null, 2));
  } finally {
    await finishCheck(scanDetails);
  }
}

async function run() {
  try {
    const runFunction = checks ? runScanWithChecks : runScan;

    await runFunction();
  } catch (error) {
    core.setFailed(error);
    core.debug(error.stack);
  }
}

run();
