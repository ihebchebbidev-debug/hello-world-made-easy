// Rename TanStack Start's _shell.html to index.html so the dist/client folder
// is deployable as a plain static SPA to Apache/Nginx/cPanel/S3.
import { copyFileSync, existsSync, renameSync } from "node:fs";
import { resolve } from "node:path";

const clientDir = resolve("dist/client");
const shell = resolve(clientDir, "_shell.html");
const index = resolve(clientDir, "index.html");

if (existsSync(shell)) {
  copyFileSync(shell, index);
  console.log("[postbuild-spa] Created dist/client/index.html from _shell.html");
} else if (existsSync(index)) {
  console.log("[postbuild-spa] dist/client/index.html already exists");
} else {
  console.warn("[postbuild-spa] No _shell.html or index.html found in dist/client");
  process.exit(1);
}
