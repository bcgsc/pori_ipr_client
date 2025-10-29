import {
  KbMatchType, KbMatchedStatementType,
} from '@/common';

/**
 * Constant for Rapid Summary tables of relevance to avoid showing to users
 */
const RESTRICTED_RELEVANCE_LIST: KbMatchedStatementType['relevance'][] = ['eligibility'];

/**
 * Bins Variants by relevance, if on of Variant's many kbMatchedStatements contain said relevance
 * @param kbMatches
 * @returns A map with keys as relevance, values as Variants that has kbMatchedStatements with said relevance
 */
const getVariantRelevanceDict = (kbMatches: KbMatchType[]) => {
  const relevanceDict: Record<string, KbMatchType[]> = {};
  kbMatches.forEach((variant) => {
    for (const { relevance } of variant.kbMatchedStatements) {
      if (relevance) {
        if (!relevanceDict[relevance]) {
          // Make new entry by relevance key
          relevanceDict[relevance] = [variant];
        } else if (
          relevanceDict[relevance].length >= 0
          // Do not add repeat variants
          && !relevanceDict[relevance].map(({ ident }) => ident).includes(variant.ident)
        ) {
          relevanceDict[relevance].push(variant);
        }
      }
    }
  });
  return relevanceDict;
};

export {
  RESTRICTED_RELEVANCE_LIST,
  getVariantRelevanceDict,
};
