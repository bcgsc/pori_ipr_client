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
    return `${variant.gene.name} ${variant.expressionState}`;
  };

  const getBucketKey = (entry, delimiter = '||') => {
    if (entry.variant.gene1) {
      const {
        context,
        variantType,
        variant,
        variant: { gene1: { name: gene1Name }, gene2: { name: gene2Name } },
      } = entry;
      const variantName = getVariantName(variant, variantType);
      return `${gene1Name}${delimiter}${gene2Name}${delimiter}${context}${delimiter}${variantName}`;
    }
    const {
      context,
      variant,
      variantType,
      variant: { gene: { name: geneName } },
    } = entry;
    const variantName = getVariantName(variant, variantType);
    return `${geneName}${delimiter}${context}${delimiter}${variantName}`;
  };

  const buckets = {};

  entries.forEach((entry) => {
    const bucketKey = getBucketKey(entry);
    if (!buckets[bucketKey]) {
      buckets[bucketKey] = {
        ...entry, reference: entry.reference.split(';'),
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
};

export default coalesceEntries;
