const kbMatchStatementsObsVarValueGetter = (params) => {
  const { data: { kbMatches } } = params;
  const kbMatchesNonNull = kbMatches?.filter((match) => !Array.isArray(match));

  if (kbMatchesNonNull) {
    const variantArr = [];
    for (const kbMatch of kbMatchesNonNull) {
      switch (kbMatch?.variantType) {
        case ('cnv'):
          variantArr.push(`${kbMatch?.variant.gene.name} ${kbMatch?.variant.cnvState}`);
          break;
        case ('sv'):
          variantArr.push(`(${kbMatch?.variant.gene1.name || '?'
          },${kbMatch?.variant.gene2.name || '?'
          }):fusion(e.${kbMatch?.variant.exon1 || '?'
          },e.${kbMatch?.variant.exon2 || '?'
          })`);
          break;
        case ('mut'):
          variantArr.push(`${kbMatch?.variant.gene.name}:${kbMatch?.variant.proteinChange}`);
          break;
        case ('tmb'):
          variantArr.push(kbMatch?.variant.kbCategory);
          break;
        case ('msi'):
          variantArr.push(kbMatch?.variant.kbCategory);
          break;
        default:
          variantArr.push(`${kbMatch?.variant.gene.name} ${kbMatch?.variant.expressionState}`);
          break;
      }
    }
    return variantArr.join(', ');
  }
  return null;
};

export default kbMatchStatementsObsVarValueGetter;
