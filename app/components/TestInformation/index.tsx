import React from 'react';
import {
  Grid,
} from '@mui/material';
import ReadOnlyTextField from '../ReadOnlyTextField';
import TestInformationType from './types';

import './index.scss';

type TestInformationProps = {
  data: TestInformationType;
  isPharmacogenomic: boolean;
};

const TestInformation = ({
  data: {
    fusionGenes,
    fusionProbe,
    fusionVars,
    kbVersion,
    snpGenes,
    snpProbe,
    snpVars,
    germlineGenes,
    germlineVars,
    pharmacogenomicGenes,
    pharmacogenomicVars,
  },
  isPharmacogenomic,
}: TestInformationProps): JSX.Element => (
  <Grid className="grid" direction="row" container>
    <Grid direction="column" container className="grid--third">
      <Grid item>
        <ReadOnlyTextField isUnderlined={false} label="Variant Probe Version">
          {snpProbe}
        </ReadOnlyTextField>
      </Grid>
      <Grid item>
        <ReadOnlyTextField isUnderlined={false} label="Fusion Probe Version">
          {fusionProbe}
        </ReadOnlyTextField>
      </Grid>
      <Grid item>
        <ReadOnlyTextField isUnderlined={false} label="Knowledgebase Version">
          {kbVersion}
        </ReadOnlyTextField>
      </Grid>
    </Grid>
    {isPharmacogenomic ? (
      <>
        <Grid direction="column" container className="grid--third">
          <Grid item>
            <ReadOnlyTextField isUnderlined={false} label="Cancer Predisposition Genes Screened">
              {germlineGenes}
            </ReadOnlyTextField>
          </Grid>
          <Grid item>
            <ReadOnlyTextField isUnderlined={false} label="Cancer Predisposition Variants Screened">
              {germlineVars}
            </ReadOnlyTextField>
          </Grid>
        </Grid>
        <Grid direction="column" container className="grid--third">
          <Grid item>
            <ReadOnlyTextField isUnderlined={false} label="Pharmacogenomic Genes Screened">
              {pharmacogenomicGenes}
            </ReadOnlyTextField>
          </Grid>
          <Grid item>
            <ReadOnlyTextField isUnderlined={false} label="Pharmacogenomic Variants Screened">
              {pharmacogenomicVars}
            </ReadOnlyTextField>
          </Grid>
        </Grid>
      </>
    ) : (
      <>
        <Grid direction="column" container className="grid--third">
          <Grid item>
            <ReadOnlyTextField isUnderlined={false} label="Genes Screened">
              {snpGenes}
            </ReadOnlyTextField>
          </Grid>
          <Grid item>
            <ReadOnlyTextField isUnderlined={false} label="Variants Screened">
              {snpVars}
            </ReadOnlyTextField>
          </Grid>
        </Grid>
        <Grid direction="column" container className="grid--third">
          <Grid item>
            <ReadOnlyTextField isUnderlined={false} label="Fusion Genes Screened">
              {fusionGenes}
            </ReadOnlyTextField>
          </Grid>
          <Grid item>
            <ReadOnlyTextField isUnderlined={false} label="Fusion Variants Screened">
              {fusionVars}
            </ReadOnlyTextField>
          </Grid>
        </Grid>
      </>
    )}
  </Grid>
);

export type { TestInformationType };

export default TestInformation;
