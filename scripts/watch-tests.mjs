import { spawn } from "node:child_process";
import { existsSync, watch } from "node:fs";
import { basename, join } from "node:path";

const testArgs = process.argv.slice(2);
const changedTests = new Set();

let child;
let debounce;
let runSuite = true;
let stopping = false;

function runTests() {
  if (stopping || child) return;

  const testFiles = [...changedTests].filter(existsSync);
  changedTests.clear();
  if (!runSuite && testFiles.length === 0) return;

  const args = runSuite || testArgs.length > 0 ? testArgs : testFiles;
  runSuite = false;
  child = spawn(
    "sh",
    ["scripts/with-test-db.sh", "watch", process.execPath, "--test", ...args],
    { stdio: "inherit" },
  );
  child.on("error", (error) => console.error(error.message));
  child.on("close", () => {
    child = undefined;
    if (!debounce) runTests();
  });
}

function scheduleTests() {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    debounce = undefined;
    runTests();
  }, 200);
}

function watchSources(directory) {
  return watch(directory, { recursive: true }, (_, filename) => {
    if (!filename) {
      runSuite = true;
    } else {
      const name = basename(filename);
      if (name.startsWith(".") || !/\.(?:[cm]?[jt]s|json)$/.test(name)) return;

      if (/^(?:test|test[-_].+|.+[-_.](?:test|spec))\.[cm]?[jt]s$/.test(name)) {
        changedTests.add(join(directory, filename));
      } else {
        runSuite = true;
      }
    }
    scheduleTests();
  });
}

const watchers = [
  watchSources("app/src"),
  watchSources("modules/src"),
  watch("scripts", (_, filename) => {
    if (!filename || filename === "test-seed.sql") {
      runSuite = true;
      scheduleTests();
    }
  }),
];

function stop() {
  stopping = true;
  clearTimeout(debounce);
  for (const watcher of watchers) watcher.close();
}

process.once("SIGINT", stop);
process.once("SIGTERM", stop);
runTests();
