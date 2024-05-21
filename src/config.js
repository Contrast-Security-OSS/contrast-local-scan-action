const core = require("@actions/core");
const github = require("@actions/github");

const DEFAULT_BRANCH_NAME = github.context.payload?.repository?.default_branch;

const thisBranchName = () => {
  core.info('Checking branch name');
  core.info(github.context.payload);

  const refParts = github.context.payload.ref.split('/');

  return refParts[refParts.length-1];
};

const isDefaultBranch = () => {

  const input = core.getInput("defaultBranch")?.toLowerCase();

  if (["true", "false"].includes(input)) {
    core.info(`User set defaultBranch to ${input}`);
    return core.getBooleanInput("defaultBranch");
  }

  return DEFAULT_BRANCH_NAME === thisBranchName();
};

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
const defaultBranch = isDefaultBranch();

const label = core.getInput("label") || process.env.GITHUB_REF;

// Pinning the local scanner version
const localScannerVersion = "1.0.10";

const memory = core.getInput("memory");
const path = core.getInput("path") || process.env.GITHUB_WORKSPACE;
const projectName =
  core.getInput("projectName") || process.env.GITHUB_REPOSITORY;
const ref = process.env.GITHUB_REF;
const resourceGroup = core.getInput("resourceGroup");
const severity = core.getInput("severity")?.toLowerCase() || undefined;
const strategy = core.getInput("strategy") || "project";
const timeout = core.getInput("timeout");
const title = "Contrast Local Scan";
const token = core.getInput("token");

core.debug(`Default branch name : ${DEFAULT_BRANCH_NAME}`);
core.debug(`This branch name : ${thisBranchName()}`);
core.debug(`Default branch resolved setting : ${defaultBranch}`)

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
  defaultBranch,
  label,
  localScannerVersion,
  memory,
  path,
  projectName,
  ref,
  resourceGroup,
  severity,
  strategy,
  timeout,
  title,
  token,
};
