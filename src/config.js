const core = require("@actions/core");

const requiredInputOptions = {required:true};

const apiUrl = core.getInput("apiUrl", requiredInputOptions);
const apiUserName = core.getInput("apiUserName", requiredInputOptions);
const apiApiKey = core.getInput("apiKey", requiredInputOptions);
const apiServiceKey = core.getInput("apiServiceKey", requiredInputOptions);
const apiOrgId = core.getInput("apiOrgId", requiredInputOptions);

const apiBaseUrl = `${
  new URL(apiUrl).origin
}/Contrast/api/sast/v1/organizations/${apiOrgId}`;
const apiAuthHeader = Buffer.from(`${apiUserName}:${apiServiceKey}`).toString(
  "base64",
);

const checks = core.getBooleanInput("checks");
const codeQuality = core.getBooleanInput("codeQuality");
const label = core.getInput("label") || process.env.GITHUB_REF;

// Pinning the local scanner version
const localScannerVersion = "1.0.8";

const memory = core.getInput("memory");
const path = core.getInput("path") || process.env.GITHUB_WORKSPACE;
const projectName =
  core.getInput("projectName") || process.env.GITHUB_REPOSITORY;
const resourceGroup = core.getInput("resourceGroup");
const severity = core.getInput("severity")?.toLowerCase() || undefined;
const strategy = core.getInput("strategy") || "project";
const timeout = core.getInput("timeout");
const title = "Contrast Local Scan";
const token = core.getInput("token");

module.exports = {
  apiUrl,
  apiBaseUrl,
  apiUserName,
  apiApiKey,
  apiServiceKey,
  apiOrgId,
  apiAuthHeader,
  checks,
  codeQuality,
  label,
  localScannerVersion,
  memory,
  path,
  projectName,
  resourceGroup,
  severity,
  strategy,
  timeout,
  title,
  token,
};
