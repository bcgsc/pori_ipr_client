import { testData1 } from './mockData';
import {
  splitVariantsByRelevance,
  getVariantRelevanceDict,
  processPotentialClinicalAssociation,
  splitIprEvidenceLevels,
} from '..';

describe('Rapid Report', () => {
  describe('Matched Tumour Type Table', () => {
    const resultData = splitVariantsByRelevance(testData1);
    test('Should split data of one variant with different relevance into separate rows', () => {
      expect(resultData.length).toEqual(2);
    });

    describe('getVariantRelevanceDict', () => {
      test('Should return an object with relevance as keys, and kbMatches as values', () => {
        const relevanceDict = getVariantRelevanceDict(testData1[0].kbMatches);
        expect(Object.keys(relevanceDict).length).toBe(2);
        expect(Object.keys(relevanceDict)).toContain('reactive');
        expect(Object.keys(relevanceDict)).toContain('sensitivity');
      });
    });

    describe('splitIprEvidenceLevels', () => {
      const iprRelevanceDict = splitIprEvidenceLevels(testData1[0].kbMatches);
      test('Should return an object with two sets with keys IPR-A and IPR-B', () => {
        expect(Object.keys(iprRelevanceDict).length).toEqual(2);
        expect(Object.keys(iprRelevanceDict)).toContain('IPR-A');
        expect(Object.keys(iprRelevanceDict)).toContain('IPR-B');
      });

      test('Should remove brackets from each context', () => {
        expect(/\[[^[\]]*\]/g.test(
          Array.from(iprRelevanceDict['IPR-A']).join(''),
        )).toBeFalsy();
        expect(/\[[^[\]]*\]/g.test(
          Array.from(iprRelevanceDict['IPR-B']).join(''),
        )).toBeFalsy();
      });
    });

    describe('processPotentialClinicalAssociation', () => {
      const processedVariant = processPotentialClinicalAssociation(testData1[0]);
      test('Should return an array of variants with the correct length corresponding to number of distinct kbMatch relevance', () => {
        expect(processedVariant.length).toEqual(2);
      });

      test('Should have a new attribute called potentialClinicalAssociation to each entry', () => {
        processedVariant.forEach((v) => {
          expect(v).toHaveProperty('potentialClinicalAssociation');
        });
      });

      test('Should have correct data for potentialClinicalAssociation', () => {
        expect(processedVariant[0].potentialClinicalAssociation).toEqual(
          'sensitivity to afatinib (IPR-A), cabozantinib (IPR-B)',
        );
        expect(/afatinib \(IPR-B\)/g.test(processedVariant[0].potentialClinicalAssociation)).toEqual(false);

        expect(processedVariant[1].potentialClinicalAssociation).toEqual(
          'reactive to afatinib (IPR-A), cabozantinib (IPR-B)',
        );
        expect(/afatinib \(IPR-B\)/g.test(processedVariant[1].potentialClinicalAssociation)).toEqual(false);
      });

      test('Should append relevance to ident to differentiate each row for proper rendering', () => {
        expect(processedVariant[0].ident).toEqual('test-ident-sensitivity');
        expect(processedVariant[1].ident).toEqual('test-ident-reactive');
      });
    });
  });
});
