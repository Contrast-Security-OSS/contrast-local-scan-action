const exec = require("@actions/exec");
const getSeverities = require("./severities");
const { getProjectId, getScanId, getNumberOfIssues } = require("./matchers");

const {
  apiApiKey,
  apiBaseUrl,
  apiOrgId,
  apiUserName,
  apiServiceKey,
  checks,
  codeQuality,
  defaultBranch,
  label,
  memory,
  newVulnerabilitiesOnly,
  path,
  projectName,
  ref,
  resourceGroup,
  severity,
  strategy,
  timeout,
  title,
} = require("./config");

const SEVERITIES = ["critical", "high", "medium", "low", "note"];

function envOpts() {
  return {
    ...process.env,
    CONTRAST__API__URL: apiBaseUrl,
    CONTRAST__API__USER_NAME: apiUserName,
    CONTRAST__API__API_KEY: apiApiKey,
    CONTRAST__API__SERVICE_KEY: apiServiceKey,
    CONTRAST__API__ORGANIZATION: apiOrgId,
  };
}

function scanOpts(jar) {
  const options = [
    "-jar",
    jar,
    "--project-name",
    projectName,
    "--label",
    label,
  ];

  if (codeQuality) {
    options.push("-q");
  }

  if (memory) {
    options.push("--memory", memory);
  }

  if (timeout) {
    options.push("--timeout", timeout);
  }

  if (resourceGroup) {
    options.push("-r", resourceGroup);
  }

  if (!defaultBranch) {
    options.push("--branch", ref);
  }

  options.push(path);

  return options;
}

function mapSeverities(severityCounts) {
  const mappedSeverities = severityCounts.reduce((severities, severity) => {
    severities[severity.severity.toLowerCase()] = severity.count;
    return severities;
  }, {});

  return {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    note: 0,
    ...mappedSeverities,
  };
}

function addFailedResult(scanDetails, severity = "note") {
  scanDetails.thresholdResults = 0;

  const includedSeverities = SEVERITIES.slice(
    0,
    SEVERITIES.indexOf(severity) + 1,
  );

  for (const includedSeverity of includedSeverities) {
    scanDetails.thresholdResults += scanDetails[strategy][includedSeverity];
  }

  return scanDetails;
}

async function getScanDetailsFromOutput(scanOutput) {
  const numberOfIssues = getNumberOfIssues(scanOutput);
  const projectId = getProjectId(scanOutput);
  const scanId = getScanId(scanOutput);

  if (!projectId || !scanId) {
    throw new Error(`Could not get valid details to query scan results`);
  }

  const host = new URL(apiBaseUrl).origin;

  const scanDetails = {
    numberOfIssues,
    thresholdResults: 0,
    project: {
      id: projectId,
      name: projectName,
      url: `${host}/Contrast/static/ng/index.html#/${apiOrgId}/scans/${projectId}`,
    },
    scan: {
      id: scanId,
      name: label,
      url: `${host}/Contrast/static/ng/index.html#/${apiOrgId}/scans/${projectId}/scans/${scanId}`,
    },
  };

  if (severity || checks) {
    const { project, scan } = await getSeverities(projectId, scanId, newVulnerabilitiesOnly);
    Object.assign(scanDetails.project, mapSeverities(project));
    Object.assign(scanDetails.scan, mapSeverities(scan));
  }

  return addFailedResult(scanDetails, severity);
}

async function scan(jar) {
  let rawOutput = "";

  const exitCode = await exec.exec("java", scanOpts(jar), {
    env: envOpts(),
    ignoreReturnCode: true,
    listeners: {
      stdout: (data) => {
        rawOutput += data.toString();
      },
    },
  });

  if (exitCode !== 0) {
    throw new Error(`${title} failed with exitCode ${exitCode}`);
  }

  const scanDetails = await getScanDetailsFromOutput(rawOutput);

  return {
    exitCode,
    baseUrl: new URL(apiBaseUrl).origin,
    orgId: apiOrgId,
    ...scanDetails,
  };
}

module.exports = scan;
