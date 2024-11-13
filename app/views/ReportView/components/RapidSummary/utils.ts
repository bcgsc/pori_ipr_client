import {
  KbMatchType,
} from '@/common';

const getVariantRelevanceDict = (kbMatches: KbMatchType[]) => {
  const relevanceDict: Record<string, KbMatchType[]> = {};
  kbMatches.forEach((match) => {
    if (!relevanceDict[match.kbMatchedStatements[0].relevance]) {
      relevanceDict[match.kbMatchedStatements[0].relevance] = [match];
    } else {
      relevanceDict[match.kbMatchedStatements[0].relevance].push(match);
    }
  });
  return relevanceDict;
};

export {
  getVariantRelevanceDict,
};
