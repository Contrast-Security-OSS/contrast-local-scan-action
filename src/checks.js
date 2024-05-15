const github = require("@actions/github");
const core = require("@actions/core");
const buildReport = require("./report");
const { title, token } = require("./config");

const octokit = github.getOctokit(token);

let CHECK_ID;

async function startCheck() {
  const { owner, repo } = github.context.repo;

  const pullRequest = github.context.payload.pull_request;
  const sha = (pullRequest && pullRequest.head.sha) || github.context.sha;

  try {

    const response = await octokit.rest.checks.create({
      owner,
      repo,
      name: title,
      head_sha: sha,
      status: "in_progress",
      output: {
        title,
        summary: "",
        text: "",
      },
    });

    CHECK_ID = response.data.id;
  }
  catch (error) {
    throw new Error("Error creating check. Ensure your workflow has the 'checks:write' permissions - https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs")
  }
}

function getOutputModel(details) {
  return {
    conclusion: details.thresholdResults > 0 ? "action_required" : "success",
    report: buildReport(details),
  };
}

async function finishCheck(details) {
  const { owner, repo } = github.context.repo;
  const { conclusion, report } = getOutputModel(details);

  if (!CHECK_ID) {
    core.warning("No active check to finish.");
    return;
  }

  await octokit.rest.checks.update({
    owner,
    repo,
    check_run_id: CHECK_ID,
    conclusion,
    status: "completed",
    output: {
      title,
      summary: "Scan Completed",
      text: report,
    },
  });
}

module.exports = {
  startCheck,
  finishCheck,
};
