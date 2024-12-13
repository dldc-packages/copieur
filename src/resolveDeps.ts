import { exists } from "@std/fs";
import { dirname, resolve } from "@std/path";
import { Project } from "@ts-morph/ts-morph";
import type { TPackageJson } from "./readPackageJson.ts";

export interface TResolvedDeps {
  files: string[];
  dependencies: Record<string, string>;
}

export async function resolveDeps(
  repoPath: string,
  remotePath: string,
  baseFiles: string[],
  remotePkg: TPackageJson
): Promise<TResolvedDeps> {
  const baseFolder = resolve(repoPath, remotePath);
  const project = new Project();
  const dependencies: Record<string, string> = {};
  const queue = [...baseFiles];
  const files = new Set<string>();

  while (queue.length > 0) {
    const file = queue.pop()!;
    if (files.has(file)) {
      continue;
    }
    await handleFile(file);
  }

  return {
    dependencies,
    files: Array.from(files),
  };

  async function handleFile(path: string) {
    if (!path.startsWith(baseFolder)) {
      throw new Error(`File ${path} is not in the base folder`);
    }
    files.add(path);
    const directory = dirname(path);
    const sourceFile = project.addSourceFileAtPath(path);
    // Extract all imports
    const imports = sourceFile.getImportDeclarations();
    for (const imp of imports) {
      const moduleSpecifier = imp.getModuleSpecifier().getLiteralText();
      await handleImport(directory, moduleSpecifier);
    }
    // Extract all "export from"
    const exportFroms = sourceFile.getExportDeclarations();
    for (const exp of exportFroms) {
      const moduleSpecifier = exp.getModuleSpecifier();
      if (moduleSpecifier) {
        await handleImport(directory, moduleSpecifier.getLiteralText());
      }
    }
  }

  async function handleImport(directory: string, moduleSpecifier: string) {
    if (moduleSpecifier.startsWith(".")) {
      const importPath = resolve(directory, moduleSpecifier);
      const resolved = await resolveNodeFile(importPath);
      if (resolved) {
        queue.push(resolved);
      }
      return;
    }
    // Find in dependencies
    const dep = findDependency(remotePkg.dependencies, moduleSpecifier);
    if (dep) {
      dependencies[dep.name] = dep.version;
      return;
    }
    const devDep = findDependency(remotePkg.devDependencies, moduleSpecifier);
    if (devDep) {
      dependencies[devDep.name] = devDep.version;
      return;
    }
    throw new Error(
      `Could not resolve module ${moduleSpecifier} in ${directory}`
    );
  }
}

/**
 * Try to add extension to a file path until it exists
 * Implementing node resolution algorithm
 */
async function resolveNodeFile(
  path: string,
  allowDirectory = true
): Promise<string | null> {
  if (await exists(path, { isFile: true })) {
    return path;
  }
  // Try to add extensions
  const extensions = [".ts", ".tsx", ".js", ".jsx"];
  for (const ext of extensions) {
    const newPath = path + ext;
    if (await exists(newPath)) {
      return newPath;
    }
  }
  if (allowDirectory && (await exists(path, { isDirectory: true }))) {
    // Try to resolve index file
    const newPath = resolve(path, "index");
    return resolveNodeFile(newPath, false);
  }
  return null;
}

function findDependency(
  deps: Record<string, string>,
  moduleSpecifier: string
): { name: string; version: string } | null {
  for (const [mode, version] of Object.entries(deps)) {
    if (mode === moduleSpecifier) {
      return { name: mode, version };
    }
    if (moduleSpecifier.startsWith(mode + "/")) {
      return { name: mode, version };
    }
  }
  return null;
}
