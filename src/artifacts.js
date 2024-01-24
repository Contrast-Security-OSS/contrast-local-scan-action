const request = require("./request");

async function getArtifacts(version = "latest") {
  return await request(`/release-artifacts/local-scanner/${version}`);
}

module.exports = getArtifacts;
