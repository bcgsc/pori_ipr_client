class CoalesceEntriesError extends Error {
  constructor(error) {
    super(`Error coalescing entry: ${error.message}`);
    this.name = 'CoalesceEntriesError';
    this.stack = error.stack;
  }
}

/**
 * Merges duplicated entries based on gene, context, and variant
 * @param {array} entries kb matches to be coalesced
 * @returns {array} bucketed entries post merge
 */
const coalesceEntries = (entries) => {
  const getVariantName = (variant, variantType) => {
    if (variantType === 'cnv') {
      return `${variant.gene.name} ${variant.cnvState}`;
    }
    if (variantType === 'sv') {
      return `(${
        variant.gene1.name || '?'
      },${
        variant.gene2.name || '?'
      }):fusion(e.${
        variant.exon1 || '?'
      },e.${
        variant.exon2 || '?'
      })`;
    }
    if (variantType === 'mut') {
      return `${variant.gene.name}:${variant.proteinChange}`;
    }

    if (variantType === 'msi' || variantType === 'tmb') {
      return variant.kbCategory;
    }

    return `${variant.gene.name} ${variant.expressionState}`;
  };

  const getBucketKey = (entry, delimiter = '||') => {
    const {
      context,
      variant,
      variantType,
    } = entry;
    const variantName = getVariantName(variant, variantType);
    if (entry.variant.gene1) {
      const {
        variant: { gene1: { name: gene1Name }, gene2: { name: gene2Name } },
      } = entry;
      return `${gene1Name}${delimiter}${gene2Name}${delimiter}${context}${delimiter}${variantName}`;
    }

    if (entry.variantType === 'msi') {
      const { kbCategory } = variant;
      return `${kbCategory}${delimiter}${context}${delimiter}${variantName}`;
    }

    const {
      variant: { gene: { name: geneName } },
    } = entry;
    return `${geneName}${delimiter}${context}${delimiter}${variantName}`;
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
