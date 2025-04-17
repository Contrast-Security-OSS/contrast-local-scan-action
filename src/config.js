const core = require("@actions/core");
const github = require("@actions/github");

const PULL_REQUEST_EVENT = 'pull_request';
const WORKFLOW_DISPATCH = 'workflow_dispatch';
const PUSH_EVENT = 'push';
const DEFAULT_BRANCH_NAME = github.context.payload?.repository?.default_branch;

const getRef = () => {

  switch (github.context.eventName) {
    case PULL_REQUEST_EVENT: {
      return github.context.payload?.pull_request?.head?.ref;
    }
    case PUSH_EVENT:
    case WORKFLOW_DISPATCH: {
      return github.context.payload?.ref;
    }
    default: {
      core.warning(`Received unexpected github event ${github.context.eventName}`);
      return github.context.payload?.ref || github.context.ref;
    }
  }
};

const thisBranchName = () => {

  const ref = getRef();
  
  try {

    const refParts = ref.split('/');

    return refParts[refParts.length-1];
  }
  catch (error) {
    core.error(`Unable to get current branch name from ref ${ref} : ${error.message}`);
  }

  return DEFAULT_BRANCH_NAME
};

const isDefaultBranch = () => {

  const input = core.getInput("defaultBranch")?.toLowerCase();

  if (["true", "false"].includes(input)) {
    core.info(`User set defaultBranch to ${input}`);
    return core.getBooleanInput("defaultBranch");
  }

  return DEFAULT_BRANCH_NAME === thisBranchName();
};

const isNewVulnerabilitiesOnly = () => {

  const input = core.getInput("new")?.toLowerCase();

  if (["true", "false"].includes(input)) {
    core.info(`User set new to ${input}`);
    return core.getBooleanInput("new");
  }

  // If not specified, we look for new vulnerabilities only when not on the default branch
  return !isDefaultBranch();
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
const newVulnerabilitiesOnly = isNewVulnerabilitiesOnly();

const ref = getRef();
const label = core.getInput("label") || ref;

// Pinning the local scanner version
const localScannerVersion = "1.1.7";

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

core.debug(`Default branch name : ${DEFAULT_BRANCH_NAME}`);
core.debug(`This branch name : ${thisBranchName()}`);
core.debug(`Default branch resolved setting : ${defaultBranch}`)
core.debug(JSON.stringify(github.context, null, 2));

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
  newVulnerabilitiesOnly,
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
