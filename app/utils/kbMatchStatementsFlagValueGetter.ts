const kbMatchStatementsFlagValueGetter = (params) => {
  const { data: { kbMatches } } = params;
  if (kbMatches) {
    const kbMatchesNonNull = kbMatches?.filter((match) => !Array.isArray(match));
    if (kbMatchesNonNull) {
      const flagArr = [];
      for (const kbMatch of kbMatchesNonNull) {
        flagArr.push(...kbMatch?.variant?.observedVariantAnnotation?.flags || []);
      }
      return [...new Set(flagArr)].join(', ');
    }
  }
  return null;
};

export default kbMatchStatementsFlagValueGetter;
