import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

const QUERY_KEYS_PATH = path.join(currentDir, '../app/queries/queryKeys.ts');
const OUTPUT_PATH = path.join(currentDir, '../app/queries/get.ts');

const content = fs.readFileSync(QUERY_KEYS_PATH, 'utf-8');

const keyRegex = /(\w+):\s*{([\s\S]*?)},\n\s*(?=\w+:|\}|$)/g;
const funcRegex = /(\w+):\s*\((.*?)\)\s*=>/g;

type HookEntry = {
  topKey: string;
  funcName: string;
  argList: string[];
  type: string;
};

// First pass: collect all hook entries
const hookEntries: HookEntry[] = [];
for (const match of content.matchAll(keyRegex)) {
  const [, topKey, body] = match;
  for (const funcMatch of body.matchAll(funcRegex)) {
    const [, funcName, args] = funcMatch;
    const argList = args.split(',').map((a) => a.trim()).filter(Boolean);
    const type = 'unknown';
    hookEntries.push({
      topKey, funcName, argList, type,
    });
  }
}

// Strip trailing 's' to get singular form (e.g. "reports" → "report")
const singular = (str: string) => (str.endsWith('s') ? str.slice(0, -1) : str);

const getHookName = (topKey: string, funcName: string): string => {
  const funcNameLower = funcName.toLowerCase();
  const topKeySingularLower = singular(topKey).toLowerCase();
  // If funcName already starts with the (singular) group name, skip the prefix to avoid redundancy
  if (funcNameLower.startsWith(topKeySingularLower)) {
    return `use${funcName.charAt(0).toUpperCase()}${funcName.slice(1)}`;
  }
  const groupPrefix = topKey.charAt(0).toUpperCase() + topKey.slice(1);
  return `use${groupPrefix}${funcName.charAt(0).toUpperCase()}${funcName.slice(1)}`;
};

let output = `
// AUTO-GENERATED — DO NOT EDIT
import { useQuery, QueryFunctionContext, QueryKey, UseQueryOptions } from 'react-query';
import api from '@/services/api';
import useSecurity from '@/hooks/useSecurity';
import { queryKeys } from './queryKeys';
import { ErrorMixin } from '@/services/errors/errors';

type QueryParams = Record<string, string | number | boolean | undefined>;

type AuthedQueryOptions<TQueryFnData, TData = TQueryFnData> = Partial<
  UseQueryOptions<TQueryFnData, Error | ErrorMixin, TData>
> & { queryParams?: QueryParams };

const pathFromQueryKey = (queryKey: string | readonly string[]) => {
  const segments = typeof queryKey === 'string' ? [queryKey] : [...queryKey];
  if (!segments.length) return '/';
  const lastSegment = segments[segments.length - 1];
  const prefixSegments = segments.slice(0, -1);
  const prefix = prefixSegments.map(s => encodeURIComponent(s)).filter(Boolean).join('/');
  const basePath = prefix ? \`/\${prefix}\` : '';
  if (lastSegment.startsWith('?')) return basePath + lastSegment;
  if (basePath) return \`\${basePath}/\${encodeURIComponent(lastSegment)}\`;
  return \`/\${encodeURIComponent(lastSegment)}\`;
};

const buildQueryString = (queryParams?: QueryParams) => {
  if (!queryParams) return '';
  const search = new URLSearchParams(Object.entries(queryParams).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]));
  return search.toString() ? \`?\${search.toString()}\` : '';
};

const genericFetcher = async <T>({ queryKey }: QueryFunctionContext<QueryKey>) => {
  const data = await api.get(pathFromQueryKey(queryKey as string | readonly string[])).request();
  return data as T;
};

const useAuthedQuery = <TQueryFnData, TData = TQueryFnData>(
  baseKey: readonly string[],
  { queryParams, enabled, ...queryOptions }: AuthedQueryOptions<TQueryFnData, TData> = {},
) => {
  const { authorizationToken } = useSecurity();
  const hasAuthToken = Boolean(authorizationToken);
  const queryString = buildQueryString(queryParams);
  const queryKey = queryString ? [...baseKey, queryString] : [...baseKey];
  return useQuery<TQueryFnData, Error | ErrorMixin, TData>({ queryKey, queryFn: genericFetcher, enabled: enabled ?? hasAuthToken, ...queryOptions });
};
`;

const hookNames: string[] = [];

for (const {
  topKey, funcName, argList, type,
} of hookEntries) {
  const hookName = getHookName(topKey, funcName);
  hookNames.push(hookName);

  const params = [
    ...argList.map((a) => `  ${a}: string`),
    '  queryOptions?: AuthedQueryOptions<TQueryFnData, TData>',
    '  queryParams?: QueryParams',
  ].join(',\n');

  output += `
const ${hookName} = <TQueryFnData = ${type}, TData = TQueryFnData>(
${params},
) => useAuthedQuery<TQueryFnData, TData>(
  queryKeys.${topKey}.${funcName}(${argList.join(', ')}),
  { ...queryOptions, queryParams },
);
`;
}

output += `\nexport {\n${hookNames.join(',\n')}\n};\n`;

fs.writeFileSync(OUTPUT_PATH, output, 'utf-8');
// eslint-disable-next-line no-console
console.log('✅ Generated query hooks at', OUTPUT_PATH);
