const Mustache = require("mustache");
const fs = require("fs");
const path = require("path");

const REPORT_TEMPLATE = fs
  .readFileSync(path.join(__dirname, "report", "report.template"))
  .toString();

module.exports = (scanDetails) => Mustache.render(REPORT_TEMPLATE, scanDetails);
