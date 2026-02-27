import fs from 'fs';
import path from 'path';

const DEFAULT_SWAGGER_URL = 'https://iprdev-api.bcgsc.ca/api/spec.json';
const SPEC_URL = process.env.SWAGGER_URL ?? DEFAULT_SWAGGER_URL;
const OUTPUT_PATH = path.resolve('app/queries/queryKeys.ts');

if (!SPEC_URL) {
  console.error('❌ Missing SWAGGER_URL env var');
  process.exit(1);
}

const toCamel = (str: string): string => str
  .replace(/{|}/g, '')
  .replace(/[-_](.)/g, (_, c: string) => c.toUpperCase());

const groupPaths = (paths: Record<string, unknown>): Record<string, string[][]> => {
  const grouped: Record<string, string[][]> = {};

  for (const route of Object.keys(paths)) {
    const segments = route.split('/').filter(Boolean);
    const [root] = segments;

    if (!grouped[root]) grouped[root] = [];
    grouped[root].push(segments);
  }

  return grouped;
};

const normalizeParam = (str: string): string => str
  .replace(/[{}]/g, '')
  .replace(/[^a-zA-Z0-9]/g, ' ')
  .split(' ')
  .filter(Boolean)
  .map((word, i) => (i === 0
    ? word.charAt(0).toLowerCase() + word.slice(1)
    : word.charAt(0).toUpperCase() + word.slice(1)))
  .join('');

const buildFile = (grouped: Record<string, string[][]>): string => {
  let output = '// AUTO-GENERATED — DO NOT EDIT\n\n';
  output += 'export const queryKeys = {\n';

  for (const [group, routes] of Object.entries(grouped)) {
    output += `  ${toCamel(group)}: {\n`;
    output += `    all: () => ['${group}'] as const,\n\n`;

    for (const segments of routes.filter((s) => s.length > 1)) {
      const fnParamsArray = segments
        .filter((s) => s.startsWith('{'))
        .map((s) => `${normalizeParam(s)}Ident`);

      const methodSegments = segments.slice(1).map((s) => (s.startsWith('{') ? normalizeParam(s) : s));
      const methodName = toCamel(methodSegments.join('_'));

      const fnParams = fnParamsArray.join(', ');

      const keyParts = segments
        .map((s) => (s.startsWith('{') ? fnParamsArray.shift() : `'${s}'`))
        .join(', ');

      output += `    ${methodName}: (${fnParams}) => [${keyParts}] as const,\n`;
    }

    output += '  },\n\n';
  }
  output += '};\n';
  return output;
};

const run = async (): Promise<void> => {
  console.log(`Fetching OpenAPI spec from ${SPEC_URL}...`);

  const res = await fetch(SPEC_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch spec (${res.status})`);
  }

  const spec = await res.json() as { paths?: Record<string, unknown> };

  if (!spec.paths) {
    throw new Error('Invalid spec: missing paths');
  }

  const grouped = groupPaths(spec.paths);
  const fileContent = buildFile(grouped);

  fs.writeFileSync(OUTPUT_PATH, fileContent);

  console.log(`✅ Generated queryKeys.ts at ${OUTPUT_PATH}`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
