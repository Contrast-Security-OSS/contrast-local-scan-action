const request = require("./request");
const core = require("@actions/core");

const COMPLETED = "COMPLETED";
const CANCELLED = "CANCELLED";
const FAILED = "FAILED";

const SCAN_FINISHED_STATUSES = [COMPLETED, CANCELLED, FAILED];

const RESULT_OPEN_STATUSES = [
  "REPORTED",
  "CONFIRMED",
  "SUSPICIOUS",
  "REOPENED",
];

const RESULTS_OPEN_QUERY_STRING = RESULT_OPEN_STATUSES.reduce((query, status) => {
  query.append("status", status);
  return query;
}, new URLSearchParams()).toString();

async function sleep() {
  return new Promise((resolve) => setTimeout(resolve, 5000));
}

async function getScan(projectId, scanId) {
  return await request(`/projects/${projectId}/scans/${scanId}`);
}

async function waitForScanCompletion(projectId, scanId) {
  let scan;

  core.info("Waiting for results to be processed.....");

  do {
    if (scan) await sleep();

    scan = await getScan(projectId, scanId);
  } while (!SCAN_FINISHED_STATUSES.includes(scan.status));

  core.info(`Scan completed with status ${scan.status}`);

  return scan;
}

async function getProjectSeverities(projectId, newVulnerabilitiesOnly) {
  let projectSeveritiesQueryUrl = `/projects/${projectId}/results/severities?${RESULTS_OPEN_QUERY_STRING}`;

  if (newVulnerabilitiesOnly === true) {
    projectSeveritiesQueryUrl = projectSeveritiesQueryUrl + '&isNew=true';
  }

  return await request(projectSeveritiesQueryUrl);
}

async function getScanSeverities(projectId, scanId) {
  return await request(
    `/projects/${projectId}/scans/${scanId}/result-instances/severities`,
  );
}

async function getSeverities(projectId, scanId, newVulnerabilitiesOnly = false) {
  const scan = await waitForScanCompletion(projectId, scanId);

  if (scan.status !== COMPLETED) {
    throw new Error(`Scan finished with a status of ${scan.status}`);
  }

  const projectSeverities = await getProjectSeverities(projectId, newVulnerabilitiesOnly);
  const scanSeverities = await getScanSeverities(projectId, scanId);

  return {
    project: projectSeverities,
    scan: scanSeverities,
  };
}

module.exports = getSeverities;
