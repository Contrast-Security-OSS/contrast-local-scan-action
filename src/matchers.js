const PROJECT_ID_REGEX =
  /Retrieved project with name and id \[.+,(?<projectId>.+)\]/m;
const SCAN_ID_REGEX = /Running scan with scan id \[(?<scanId>.+)\]/m;
const NUMBER_OF_ISSUES_REGEX = /Found (?<numberOfIssues>[0-9+]) issues/m;

function getProjectId(text) {
  return text.match(PROJECT_ID_REGEX)?.groups?.projectId?.trim();
}

function getScanId(text) {
  return text.match(SCAN_ID_REGEX)?.groups?.scanId?.trim();
}

function getNumberOfIssues(text) {
  return text.match(NUMBER_OF_ISSUES_REGEX)?.groups?.numberOfIssues?.trim();
}

module.exports = {
  getProjectId,
  getScanId,
  getNumberOfIssues,
};
