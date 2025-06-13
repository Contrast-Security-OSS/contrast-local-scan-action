#!/bin/bash

docker run \
  -e INPUT_APIURL=$CONTRAST__API__URL \
  -e INPUT_APIUSERNAME=$CONTRAST__API__USER_NAME \
  -e INPUT_APIKEY=$CONTRAST__API__API_KEY \
  -e INPUT_APISERVICEKEY=$CONTRAST__API__SERVICE_KEY \
  -e INPUT_APIORGID=$CONTRAST__API__ORGANIZATION \
  -e INPUT_DEFAULTBRANCH=true \
  -e INPUT_CHECKS=false \
  -e INPUT_CODEQUALITY=false \
  -e INPUT_PATH=src \
  -e INPUT_LABEL="local-test" \
  -e INPUT_TOKEN=$GITHUB_TOKEN \
  -e ACTIONS_RUNTIME_TOKEN=$GITHUB_TOKEN \
  -e RUNNER_TEMP=/tmp \
  -e GITHUB_JOB="local-test" \
  -e GITHUB_REF="refs/local/test" \
  -e GITHUB_SHA=c9f043b \
  -e GITHUB_EVENT_NAME="local-test" \
  -e GITHUB_REPOSITORY=contrast-local-scan-action-test \
  -e GITHUB_REPOSITORY_OWNER=Contrast-Security-OSS \
  -e GITHUB_REPOSITORY_OWNER_ID=1 \
  -e GITHUB_RUN_ID=1 \
  -e GITHUB_RUN_NUMBER=1 \
  -e GITHUB_WORKSPACE=/workspace \
  -w /workspace \
  -v .:/workspace \
  $(docker build -q .)
  