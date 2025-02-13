import {
  KbMatchType, KbMatchedStatementType
} from '@/common';

const getVariantRelevanceDict = (kbMatches: KbMatchType[]) => {
  const relevanceDict: Record<string, KbMatchedStatementType[]> = {};
  kbMatches.forEach((match) => {
    console.log('here at 8');
    for (const statement of match.kbMatchedStatements) {
      console.log('here at 10');
      if (!relevanceDict[statement.relevance]) {
        relevanceDict[statement.relevance] = [statement];
      } else {
        relevanceDict[statement.relevance].push(statement);
      }
    }
  });
  console.dir(relevanceDict);
  return relevanceDict;
};

export {
  getVariantRelevanceDict,
};
