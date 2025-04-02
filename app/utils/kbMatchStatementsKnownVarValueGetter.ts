const kbMatchStatementsKnownVarValueGetter = (params) => {
  const { data: { kbMatches } } = params;
  if (kbMatches) {
    const kbVariants = kbMatches?.reduce((accumulator, match) => {
      if (match.kbVariant !== undefined) {
        accumulator.push(match.kbVariant);
      }
      return accumulator;
    }, []);
    return [...new Set(kbVariants)].join(', ');
  }
  return null;
};

export default kbMatchStatementsKnownVarValueGetter;
