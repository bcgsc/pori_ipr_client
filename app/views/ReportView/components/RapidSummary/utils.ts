import {
  KbMatchType,
} from '@/common';

const getVariantRelevanceDict = (kbMatches: KbMatchType[]) => {
  const relevanceDict: Record<string, KbMatchType[]> = {};
  kbMatches.forEach((match) => {
    for (const statement of match.kbMatchedStatements) {
      if (!relevanceDict[statement.relevance]) {
        relevanceDict[statement.relevance] = [match];
      } else {
        relevanceDict[statement.relevance].push(match);
      }
    }
  });
  console.log('here at 16');
  return relevanceDict;
};

export {
  getVariantRelevanceDict,
};
