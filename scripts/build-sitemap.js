#!/usr/bin/env node
"use strict";

var fs = require("fs");
var path = require("path");

var ROOT = path.resolve(__dirname, "..");
var ORIGIN = "https://panatau.com";
var LASTMOD = {
  "forest.html": "2026-10-06",
  "wooden-churches.html": "2026-10-07"
};

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

function uniqueSorted(entries) {
  var seen = {};
  var out = [];
  entries.sort(function (a, b) {
    if (a.url === ORIGIN + "/") return -1;
    if (b.url === ORIGIN + "/") return 1;
    return a.url < b.url ? -1 : a.url > b.url ? 1 : 0;
  }).forEach(function (entry) {
    if (seen[entry.url]) return;
    seen[entry.url] = true;
    out.push(entry);
  });
  return out;
}

function main() {
  var files = [];
  walk(ROOT, files);
  var entries = [];
  files.forEach(function (rel) {
    if (isRedirectOnly(rel)) return;
    entries.push({ url: toUrl(rel), lastmod: LASTMOD[rel] || "" });
  });
  entries = uniqueSorted(entries);
  var xml = [
    "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
    "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">"
  ].concat(entries.map(function (entry) {
    var lastmod = entry.lastmod ? "<lastmod>" + entry.lastmod + "</lastmod>" : "";
    return "  <url><loc>" + entry.url + "</loc>" + lastmod + "</url>";
  })).concat(["</urlset>", ""]).join("\n");
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
  console.log("Wrote " + entries.length + " URLs to sitemap.xml");
}

main();
