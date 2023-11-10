import {
  KbMatchType,
} from '@/common';

const getVariantRelevanceDict = (kbMatches: RapidVariantType['kbMatches']) => {
  const relevanceDict: Record<string, KbMatchType[]> = {};
  kbMatches.forEach((match) => {
    if (!relevanceDict[match.relevance]) {
      relevanceDict[match.relevance] = [match];
    } else {
      relevanceDict[match.relevance].push(match);
    }
  });
  return relevanceDict;
};

export {
  getVariantRelevanceDict,
};
