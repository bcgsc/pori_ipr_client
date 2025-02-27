import {
  KbMatchedStatementType, AnyVariantType, KbMatchType,
} from '@/common';

function getVariantName<V extends AnyVariantType>(variant: KbMatchType<V>['variant'], variantType: V) {
  if (variantType === 'cnv') {
    const { gene: { name: geneName }, cnvState } = variant as KbMatchType<'cnv'>['variant'];
    return `${geneName} ${cnvState}`;
  }

  if (variantType === 'sv') {
    const {
      gene1: { name: name1 },
      gene2: { name: name2 },
      exon1,
      exon2,
    } = variant as KbMatchType<'sv'>['variant'];
    return `(${name1 || '?'
    },${name2 || '?'
    }):fusion(e.${exon1 || '?'
    },e.${exon2 || '?'
    })`;
  }

  if (variantType === 'mut') {
    const { gene: { name: geneName }, proteinChange } = variant as KbMatchType<'mut'>['variant'];
    return `${geneName}:${proteinChange}`;
  }

  if (variantType === 'msi' || variantType === 'tmb') {
    return (variant as KbMatchType<'tmb' | 'msi'>['variant']).kbCategory;
  }

  if (variantType === 'sigv') {
    const { displayName } = variant as KbMatchType<'sigv'>['variant'];
    return `${displayName}`;
  }

  const { gene: { name: geneName }, expressionState } = variant as KbMatchType<'exp'>['variant'];
  return `${geneName} ${expressionState}`;
}

function getBucketKey(entry: KbMatchedStatementType, delimiter = '||') {
  const {
    context,
    kbMatches,
  } = entry;

  // If statement has multiple matches, loop through matches and create composite bucket key of different suffixes to coalesce similar statements
  if (kbMatches.length > 1) {
    let bucketKey = '';
    for (const kbMatch of kbMatches) {
      const variantName = getVariantName(kbMatch?.variant, kbMatch?.variantType);
      const { relevance, disease } = entry;
      const commonSuffix = `${context}${delimiter}${variantName}${delimiter}${relevance}${delimiter}${disease}`;
      if (kbMatch?.variantType === 'sv') {
        const {
          variant: { gene1: { name: gene1Name }, gene2: { name: gene2Name } },
        } = kbMatch as KbMatchType<'sv'>;
        bucketKey += `${gene1Name || '?'}${delimiter}${gene2Name || '?'}${delimiter}${commonSuffix}`;
      } else if (kbMatch?.variantType === 'msi' || kbMatch?.variantType === 'tmb') {
        const { kbCategory } = kbMatch.variant as KbMatchType<'tmb' | 'msi'>['variant'];
        bucketKey += `${kbCategory}${delimiter}${commonSuffix}`;
      } else {
        const {
          variant: { gene: { name: geneName } },
        } = kbMatch as KbMatchType<'cnv' | 'exp' | 'mut'>;
        bucketKey += `${geneName}${delimiter}${commonSuffix}`;
      }
    }
    return bucketKey;
  }

  if (kbMatches.length > 0) {
    const [kbMatch] = kbMatches;
    const variantName = getVariantName(kbMatch?.variant, kbMatch?.variantType);
    const { relevance, disease } = entry;
    const commonSuffix = `${context}${delimiter}${variantName}${delimiter}${relevance}${delimiter}${disease}`;
    return commonSuffix;
  }

  return null;
}

class CoalesceEntriesError extends Error {
  constructor(error) {
    super(`Error coalescing entry: ${error.message}`);
    this.name = 'CoalesceEntriesError';
    this.stack = error.stack;
  }
}

type CoalesceEntriesResult<T extends KbMatchedStatementType[]> = Array<{
  [K in keyof T[number]]: T[number][K] extends Array<infer U>
    ? U[]
    : T[number][K];
}>;

/**
 * Merges duplicated entries based on gene, context, and variant
 * @param {array} entries kb matches to be coalesced
 * @returns {array} bucketed entries post merge
 */
const coalesceEntries = <T extends KbMatchedStatementType[]>(entries: T): CoalesceEntriesResult<T> => {
  const buckets = {};
  try {
    entries.forEach((entry) => {
      const bucketKey = getBucketKey(entry);
      if (!buckets[bucketKey]) {
        buckets[bucketKey] = {
          ...entry,
          reference: entry.reference ? entry.reference.split(';') : '',
        };
      } else {
        Object.entries(entry).forEach(([key, value]) => {
          if (Array.isArray(buckets[bucketKey][key])) {
            if (!buckets[bucketKey][key].includes(value)) {
              buckets[bucketKey][key].push(value);
            }
          } else if (typeof buckets[bucketKey][key] !== 'object' && buckets[bucketKey][key] !== value) {
            buckets[bucketKey][key] = [buckets[bucketKey][key], value];
          }
        });
      }
    });

    return Object.values(buckets);
  } catch (e) {
    throw (new CoalesceEntriesError(e));
  }
};

export default coalesceEntries;

export {
  coalesceEntries,
  getVariantName,
  getBucketKey,
};
