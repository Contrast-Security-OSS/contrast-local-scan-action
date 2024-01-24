const httpm = require("@actions/http-client");
const core = require("@actions/core");

const { apiApiKey, apiAuthHeader, apiBaseUrl } = require("./config");

const httpClient = new httpm.HttpClient();

async function request(path) {
  const response = await httpClient.getJson(`${apiBaseUrl}/${path}`, {
    "api-key": apiApiKey,
    authorization: apiAuthHeader,
  });

  core.debug({path, response});
  
  if (response.statusCode !== 200) {
    throw new Error(
      `API ${path} returned a response code of ${response.statusCode}`,
    );
  }

  return response.result;
}

module.exports = request;
