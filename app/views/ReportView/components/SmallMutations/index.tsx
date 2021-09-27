import React, { useState, useEffect, useContext } from 'react';
import {
  Typography,
} from '@material-ui/core';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import { SmallMutationType } from '@/common';
import { columnDefs } from './columnDefs';

import './index.scss';

const TITLE_MAP = {
  therapeutic: 'Variants of Therapeutic Relevance',
  nostic: 'Variants of Prognostic or Diagnostic Relevance',
  biological: 'Variants of Biological Relevance',
  unknown: 'Variants of Unknown Significance',
};

const getInfoDescription = (relevance: string) => `Small mutations where the mutation matched 1 or more statements of ${relevance} relevance in the knowledge base matches section. Details on these matches can be seen in the knowledge base matches section of this report.`;

const INFO_BUBBLES = {
  biological: getInfoDescription('biological'),
  nostic: getInfoDescription('prognostic or diagnostic'),
  therapeutic: getInfoDescription('therapeutic'),
  unknown: 'Small mutations where the mutation did not match any knowledge base statements of therapeutic, biological, diagnostic, or prognostic relevance.',
};

type SmallMutationsProps = WithLoadingInjectedProps;

const SmallMutations = ({
  isLoading,
  setIsLoading,
}: SmallMutationsProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const [smallMutations, setSmallMutations] = useState<SmallMutationType[]>([]);
  const [groupedSmallMutations, setGroupedSmallMutations] = useState({
    therapeutic: [],
    nostic: [],
    biological: [],
    unknown: [],
  });

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const smallMutationsResp = await api.get(
            `/reports/${report.ident}/small-mutations`,
          ).request();
          setSmallMutations(smallMutationsResp);
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };
      getData();
    }
  }, [report, setIsLoading]);

  // Categorize small mutations
  useEffect(() => {
    if (smallMutations.length) {
      const mutations = {
        therapeutic: [],
        nostic: [],
        biological: [],
        unknown: [],
      };

      smallMutations.forEach((row) => {
        let isUnknown = true;

        if (row.kbMatches.some((m) => m.category === 'therapeutic')) {
          mutations.therapeutic.push(row);
          isUnknown = false;
        }

        if (row.kbMatches.some((m) => (m.category === 'diagnostic' || m.category === 'prognostic'))) {
          mutations.nostic.push(row);
          isUnknown = false;
        }

        if (row.kbMatches.some((m) => m.category === 'biological')) {
          mutations.biological.push(row);
          isUnknown = false;
        }

        if (isUnknown) {
          mutations.unknown.push(row);
        }
      });

      setGroupedSmallMutations(mutations);
    }
  }, [smallMutations]);

  return (
    <div className="small-mutations">
      <Typography variant="h3">
        Small Mutations
      </Typography>
      {!isLoading && (
        <>
          {Object.entries(groupedSmallMutations).map(([key, value]) => (
            <DataTable
              key={key}
              canToggleColumns
              columnDefs={columnDefs}
              rowData={value}
              titleText={TITLE_MAP[key]}
              demoDescription={INFO_BUBBLES[key]}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default SmallMutations;
