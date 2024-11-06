import {
  KbMatchedStatementType,
} from '@/common';

const getVariantRelevanceDict = (kbMatches: KbMatchedStatementType[]) => {
  const relevanceDict: Record<string, KbMatchedStatementType[]> = {};
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
