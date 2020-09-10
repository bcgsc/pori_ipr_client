import React from 'react';
import {
  Grid,
} from '@material-ui/core';
import ReadOnlyTextField from '../../../../../../components/ReadOnlyTextField';
import { TestInformationInterface } from './interfaces';

import './index.scss';

type Props = {
  data: TestInformationInterface,
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
  }
}: Props): JSX.Element => {

  return (
    <Grid direction="row" container>
      <Grid direction="column" container className="grid--half">
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
      <Grid direction="column" container className="grid--half">
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
    </Grid>
  );
};

export default TestInformation;
