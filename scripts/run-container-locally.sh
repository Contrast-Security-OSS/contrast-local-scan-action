#!/bin/bash

# INPUT_${var} where var corresponds to those defined in action.yml uppercased
#
# Other env vars are those normally passed in by the github actions runner
# as defined here https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables

file=.
project=contrast-local-scan-action-test

while getopts "f:p:" opt; do
  case $opt in
	  f) file="$OPTARG" ;;
	  p) project="$OPTARG" ;;
  esac
done

docker run \
  -e INPUT_APIURL=$CONTRAST__API__URL \
  -e INPUT_APIUSERNAME=$CONTRAST__API__USER_NAME \
  -e INPUT_APIKEY=$CONTRAST__API__API_KEY \
  -e INPUT_APISERVICEKEY=$CONTRAST__API__SERVICE_KEY \
  -e INPUT_APIORGID=$CONTRAST__API__ORGANIZATION \
  -e INPUT_DEFAULTBRANCH=false \
  -e INPUT_CHECKS=false \
  -e INPUT_CODEQUALITY=false \
  -e INPUT_LABEL="local-test" \
  -e INPUT_TOKEN=unknown \
  -e INPUT_PROJECTNAME=$project \
  -e INPUT_RESOURCEGROUP=scan \
  -e ACTIONS_RUNTIME_TOKEN=unknown \
  -e RUNNER_TEMP=/tmp \
  -e GITHUB_JOB="local-test" \
  -e GITHUB_REF="refs/local/test" \
  -e GITHUB_SHA=c9f043b \
  -e GITHUB_EVENT_NAME="push" \
  -e GITHUB_REPOSITORY=contrast-local-scan-action-test \
  -e GITHUB_REPOSITORY_OWNER=Contrast-Security-OSS \
  -e GITHUB_REPOSITORY_OWNER_ID=1 \
  -e GITHUB_RUN_ID=1 \
  -e GITHUB_RUN_NUMBER=1 \
  -e GITHUB_WORKSPACE=/workspace \
  -e GITHUB_EVENT_PATH=/github/github-event.json \
  -w /workspace \
  -v ./target:/root/contrast-local-scanner/ \
  -v ./scripts/github-event.json:/github/github-event.json \
  -v $file:/workspace \
  $(docker build -q .)
  