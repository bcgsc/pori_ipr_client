const coalesceEntries = (entries) => {
  const bucketKey = (entry, delimiter = '||') => {
    const {
      ident, updatedAt, createdAt, ...row
    } = entry;
    const { gene, context, variant } = row;
    return `${gene}${delimiter}${context}${delimiter}${variant}`;
  };

  const buckets = {};

  entries.forEach((entry) => {
    const key = bucketKey(entry);
    if (!buckets[key]) {
      buckets[key] = {
        ...entry, disease: new Set([entry.disease]), reference: new Set([entry.reference]),
      };
    } else {
      buckets[key].disease.add(entry.disease);
      buckets[key].reference.add(entry.reference);
    }
  });
  return Object.values(buckets);
};

const extractCategories = (entries, category) => {
  const grouped = new Set();
  
  entries.forEach((row) => {
    if (row.alterationType === category) {
      grouped.add(row);
    }
  });

  return [...grouped];
};

export {
  coalesceEntries,
  extractCategories,
};

