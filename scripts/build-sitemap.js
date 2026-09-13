#!/usr/bin/env node
"use strict";

var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var ORIGIN = "https://panatau.com";

function walk(dir, out) {
  fs.readdirSync(dir).forEach(function (name) {
    if (name.charAt(0) === ".") return;
    var full = path.join(dir, name);
    var rel = path.relative(ROOT, full).replace(/\\/g, "/");
    var stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name === "node_modules" || name === "images") return;
      walk(full, out);
      return;
    }
    if (name.slice(-5) === ".html") out.push(rel);
  });
}

function toUrl(rel) {
  if (rel === "index.html") return ORIGIN + "/";
  if (rel.slice(-11) === "/index.html") {
    return ORIGIN + "/" + rel.slice(0, -10);
  }
  return ORIGIN + "/" + rel;
}

function isRedirectOnly(rel) {
  var html = fs.readFileSync(path.join(ROOT, rel), "utf8");
  return /http-equiv=["']refresh["']/i.test(html) && !/<main/i.test(html);
}

function uniqueSorted(urls) {
  var seen = {};
  var out = [];
  urls.sort(function (a, b) {
    if (a === ORIGIN + "/") return -1;
    if (b === ORIGIN + "/") return 1;
    return a < b ? -1 : a > b ? 1 : 0;
  }).forEach(function (url) {
    if (seen[url]) return;
    seen[url] = true;
    out.push(url);
  });
  return out;
}

function main() {
  var files = [];
  walk(ROOT, files);
  var urls = [];
  files.forEach(function (rel) {
    if (isRedirectOnly(rel)) return;
    urls.push(toUrl(rel));
  });
  urls = uniqueSorted(urls);
  var xml = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">"
  ].concat(urls.map(function (url) {
    return "  <url><loc>" + url + "</loc></url>";
  })).concat(["</urlset>", ""]).join("\n");
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
  console.log("Wrote " + urls.length + " URLs to sitemap.xml");
}

main();
