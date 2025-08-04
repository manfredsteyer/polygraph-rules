import { createConformanceRule, ConformanceViolation } from '@nx/conformance';
import { workspaceRoot, readJsonFile } from '@nx/devkit';
import * as path from 'path';
import { AngularVersionConformanceOptions } from './angular-version-rule-options.js';

export type PackageJson = {
  dependencies: Record<string, string>
};

export default createConformanceRule({
  name: 'angular-version-rule',
  category: 'consistency',
  description: 'An example conformance rule checking for a specific Angular version',
  implementation: async (context) => {

    const options = context.ruleOptions as AngularVersionConformanceOptions;
    const version = options.version;
    const violations: ConformanceViolation[] = [];
    const packagePath = path.join(workspaceRoot, 'package.json');

    try {
      const versionViolations = checkVersions(packagePath, version);
      violations.push(...versionViolations);
    }
    catch(e) {
      violations.push({
        workspaceViolation: true,
        message: `Error reading package.json: ${e}`,
      });
    }

    return {
      severity: 'high',
      details: {
        violations,
      },
    };
  },
});

function checkVersions(packagePath: string, version: string) {
  const packageInfo = readJsonFile(packagePath) as PackageJson;
  const deps = packageInfo.dependencies;

  const versionViolations: ConformanceViolation[] = [];

  for (const dep of Object.keys(deps)) {
    if (dep.startsWith('@angular/') && deps[dep] !== version) {
      versionViolations.push({
        workspaceViolation: true,
        message: `Unexpected version of ${dep} configured in package.json. 
Expected: ${version}; found: ${deps[dep]}.`,
      });
    }
  }
  return versionViolations;
}
