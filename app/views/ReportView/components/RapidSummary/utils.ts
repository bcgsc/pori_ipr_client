import {
  KbMatchType,
} from '@/common';

/**
 * Bins Variants by relevance, if on of Variant's many kbMatchedStatements contain said relevance
 * @param kbMatches
 * @returns A map with keys as relevance, values as Variants that has kbMatchedStatements with said relevance
 */
const getVariantRelevanceDict = (kbMatches: KbMatchType[]) => {
  const relevanceDict: Record<string, KbMatchType[]> = {};
  kbMatches.forEach((variant) => {
    for (const statement of variant.kbMatchedStatements) {
      if (!relevanceDict[statement.relevance]) {
        // Make new entry by relevance key
        relevanceDict[statement.relevance] = [variant];
      } else if (
        relevanceDict[statement.relevance].length >= 0
        // Do not add repeat variants
        && !relevanceDict[statement.relevance].map(({ ident }) => ident).includes(variant.ident)
      ) {
        relevanceDict[statement.relevance].push(variant);
      }
    }
  });
  return relevanceDict;
};

export {
  getVariantRelevanceDict,
};
