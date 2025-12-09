# Use Contrast Local Scanner to analyze your code

This GitHub action lets you use Contrast Local Scanner to detect vulnerabilities in your code without uploading your code to Contrast's servers.

## Local Scan Engine

The github action uses Contrast local scan engine version 2.0.2.

Release notes for the local scan engine can be viewed here [Scan Release Notes](https://docs.contrastsecurity.com/en/scan-release-notes-and-archive.html)

## Supported Languages
- ASP.NET
- C
- C#
- C++
- COBOL
- GO
- HTML
- Java
- JavaScript/TypeScript
- JSP
- Kotlin
- PHP
- Python
- Ruby
- Scala
- VB.NET

## **Initial steps for using the action**
If you are not familiar with GitHub actions read the
[GitHub Actions](https://docs.github.com/en/actions) documentation to learn what GitHub Actions are and how to set them
up. After which, complete the following steps:

1. Configure the following GitHub secrets

   - CONTRAST__API__API_KEY
   - CONTRAST__API__ORGANIZATION
   - CONTRAST__API__SERVICE_KEY
   - CONTRAST__API__USER_NAME
   - CONTRAST__API__URL

  ![secrets](https://github.com/Contrast-Security-OSS/contrast-local-scan-action/assets/6448060/a40f01a3-b179-4837-abd2-df91a5a220fb)

2. Get your authentication details for the secrets from the 'User Settings' menu in the Contrast web interface: You will need the following 

    - Organization ID
    - Your API key
    - Service key
    - User name
    - You will also need the URL of your Contrast UI host. This input includes the protocol section of the URL (https://).

    ![credentials](https://github.com/Contrast-Security-OSS/contrast-local-scan-action/assets/6448060/7a123c22-1f5f-4091-90d3-f297959d1e20)

3. Create a workflow, or update an existing one to run this action against your code (for example, on push)

   ```yaml
     name: Scan with local scanner

     on:
       push:
         branches:
           - 'main'

     permissions:
       contents: read

     jobs:
       scan:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v3
           - uses: Contrast-Security-OSS/contrast-local-scan-action@v1
             with:
               apiUrl: ${{ secrets.CONTRAST__API__URL }}
               apiUserName: ${{ secrets.CONTRAST__API__USER_NAME }}
               apiKey: ${{ secrets.CONTRAST__API__API_KEY }}
               apiServiceKey: ${{ secrets.CONTRAST__API__SERVICE_KEY }}
               apiOrgId: ${{ secrets.CONTRAST__API__ORGANIZATION }}
   ```

4. To fail the step based on vulnerabilities being found at a severity or higher, set the severity option to one of critical, high, medium, low, note.

   *Note: this is based on the aggregated vulnerabilities found at the project level.*

   ```yaml
     scan:
     runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: Contrast-Security-OSS/contrast-local-scan-action@v1
         with:
           apiUrl: ${{ secrets.CONTRAST__API__URL }}
           apiUserName: ${{ secrets.CONTRAST__API__USER_NAME }}
           apiKey: ${{ secrets.CONTRAST__API__API_KEY }}
           apiServiceKey: ${{ secrets.CONTRAST__API__SERVICE_KEY }}
           apiOrgId: ${{ secrets.CONTRAST__API__ORGANIZATION }}
           severity: high
   ```

5. To add GitHub checks to the current commit (e.g. the current PR), set the checks option to true.

   *Note: You need the checks: write permission to be set if enabling this.*

   ![checks](https://github.com/Contrast-Security-OSS/contrast-local-scan-action/assets/6448060/d39d14c4-1f05-4ac6-8e3d-c09912ed9559)

## Required Inputs

- apiUserName : A valid user name from the Contrast platform.
- apiKey : An API key from the Contrast platform.
- apiServiceKey : An API Service Key from the Contrast platform
- apiOrgId : The ID of your organization in Contrast.

## Optional Inputs

- apiUrl : Url of your Contrast instance, defaults to https://app.contrastsecurity.com/
- checks : If set, GitHub checks will be added to the current commit based on any vulnerabilities found.
- codeQuality : Passes the -q option to the Contrast local scanner to include code quality rules in the scan.
- defaultBranch : Set this to true or false, to explicitly overwrite the default branching behaviour of this action. See note on branching below.
- label : Label to associate with the current scan. Defaults to the current ref e.g. **refs/heads/main**
- memory : Memory setting passed to the underlying scan engine. Defaulted to 8g.
- path : Path to scan with Contrast local scanner. Defaults to the current repository path.
- projectName : Project to associate scan with. Defaults to current GitHub repository name e.g. **Contrast-Security-OSS/contrast-local-scan-action**
- resourceGroup : Passes the -r option to the Contrast local scanner to associate newly created projects with the specified resource group.
- severity : Set this to cause the build to fail if vulnerabilities are found at this severity or higher. Valid values are critical, high, medium, low, note.
- timeout: Execution timeout (in minutes) setting passed to the underlying scan engine. Defaulted to 60 minutes.
- new: If set to true, only new vulnerabilities will cause a failure in the job or checks conditions. (Defaulted to true if scanning a branch).

## Branching

When a scan completes, results for the scan are aggretegated against overall results for the project.

For scans that are performed against a non default branch, results are aggregated separately from the main project, just for the current branch.

By default, this is determined by comparing the current branch name against the default for the repository, as specified by the "Default Branch" setting under repository settings.

This behaviour can be explicitly overwritten by setting the "**defaultBranch**" setting for this action to "**true**" or "**false**".


