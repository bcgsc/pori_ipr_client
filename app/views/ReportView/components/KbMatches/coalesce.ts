import {
  KbMatchType, AnyVariantType,
} from '@/common';

class CoalesceEntriesError extends Error {
  constructor(error) {
    super(`Error coalescing entry: ${error.message}`);
    this.name = 'CoalesceEntriesError';
    this.stack = error.stack;
  }
}

type CoalesceEntriesResult<T extends KbMatchType[]> = Array<{
  [K in keyof T[number]]: T[number][K] extends Array<infer U>
    ? U[]
    : T[number][K];
}>;

/**
 * Merges duplicated entries based on gene, context, and variant
 * @param {array} entries kb matches to be coalesced
 * @returns {array} bucketed entries post merge
 */
const coalesceEntries = <T extends KbMatchType[]>(entries: T): CoalesceEntriesResult<T> => {
  function getVariantName<V extends AnyVariantType>(variant: KbMatchType<V>['variant'], variantType: V) {
    if (variantType === 'cnv') {
      const { gene: { name }, cnvState } = variant as KbMatchType<'cnv'>['variant'];
      return `${name} ${cnvState}`;
    }

    if (variantType === 'sv') {
      const {
        gene1: { name: name1 },
        gene2: { name: name2 },
        exon1,
        exon2,
      } = variant as KbMatchType<'sv'>['variant'];
      return `(${
        name1 || '?'
      },${
        name2 || '?'
      }):fusion(e.${
        exon1 || '?'
      },e.${
        exon2 || '?'
      })`;
    }

    if (variantType === 'mut') {
      const { gene: { name }, proteinChange } = variant as KbMatchType<'mut'>['variant'];
      return `${name}:${proteinChange}`;
    }

    if (variantType === 'msi' || variantType === 'tmb') {
      return (variant as KbMatchType<'tmb' | 'msi'>['variant']).kbCategory;
    }

    const { gene: { name }, expressionState } = variant as KbMatchType<'exp'>['variant'];
    return `${name} ${expressionState}`;
  }

  const getBucketKey = (entry: KbMatchType, delimiter = '||') => {
    const {
      context,
      variant,
      variantType,
    } = entry;
    const variantName = getVariantName(variant, variantType);
    const { relevance, disease } = entry;
    const commonSuffix = `${context}${delimiter}${variantName}${delimiter}${relevance}${delimiter}${disease}`;
    if (variantType === 'sv') {
      const {
        variant: { gene1: { name: gene1Name }, gene2: { name: gene2Name } },
      } = entry as KbMatchType<'sv'>;
      return `${gene1Name}${delimiter}${gene2Name}${delimiter}${commonSuffix}`;
    }

    if (entry.variantType === 'msi' || entry.variantType === 'tmb') {
      const { kbCategory } = variant as KbMatchType<'tmb' | 'msi'>['variant'];
      return `${kbCategory}${delimiter}${commonSuffix}`;
    }

    const {
      variant: { gene: { name: geneName } },
    } = entry as KbMatchType<'cnv' | 'exp' | 'mut'>;
    return `${geneName}${delimiter}${commonSuffix}`;
  };

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
