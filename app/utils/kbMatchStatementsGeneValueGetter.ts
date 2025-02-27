/* eslint-disable no-continue */
const kbMStatementGeneValueGetter = (params) => {
  const { data: { kbMatches } } = params;
  if (kbMatches) {
    const kbMatchesNonNull = kbMatches?.filter((match) => !Array.isArray(match));
    if (kbMatchesNonNull.length > 1) {
      const geneName = [];
      for (const kbMatch of kbMatchesNonNull) {
        if (kbMatch?.variantType === 'msi') {
          geneName.push('msi');
        }
        if (kbMatch?.variantType === 'tmb') {
          geneName.push('tmb');
        }
        if (kbMatch?.variant?.gene) {
          geneName.push(kbMatch?.variant?.gene.name);
        }
        if (kbMatch?.variant?.gene1 && kbMatch?.variant?.gene2) {
          geneName.push(`${kbMatch?.variant?.gene1.name}, ${kbMatch?.variant?.gene2.name}`);
        }
        if (kbMatch?.variant?.gene1) {
          geneName.push(kbMatch?.variant?.gene1.name);
        }
        if (kbMatch?.variant?.gene2) {
          geneName.push(kbMatch?.variant?.gene2.name);
        }
      }
      return geneName.join(', ');
    }
    const [kbMatch] = kbMatchesNonNull;
    // msi and tmb doesn't have gene field
    if (kbMatch?.variantType === 'msi') {
      return 'msi';
    }
    if (kbMatch?.variantType === 'tmb') {
      return 'tmb';
    }
    if (kbMatch?.variantType === 'sigv') {
      return kbMatch?.variant?.displayName;
    }
    if (kbMatch?.variant?.gene) {
      return kbMatch?.variant?.gene?.name;
    }
    return kbMatch?.variant?.gene1?.name && kbMatch?.variant?.gene2?.name
      ? `${kbMatch?.variant?.gene1?.name}, ${kbMatch?.variant?.gene2?.name}`
      : kbMatch?.variant?.gene1?.name || kbMatch?.variant?.gene2?.name;
  }
  return null;
};

export default kbMStatementGeneValueGetter;
