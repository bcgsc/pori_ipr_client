import React, { useState, useEffect, useContext } from 'react';
import {
  Typography,
  LinearProgress,
} from '@material-ui/core';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import { columnDefs } from './columnDefs';
import MutationType from './types';

import './index.scss';

const titleMap = {
  therapeutic: 'Variants of Therapeutic Relevance',
  nostic: 'Variants of Prognostic or Diagnostic Relevance',
  biological: 'Variants of Biological Relevance',
  unknown: 'Variants of Unknown Significance',
};

const SmallMutations = (): JSX.Element => {
  const { report } = useContext(ReportContext);
  const [smallMutations, setSmallMutations] = useState<MutationType[]>([]);
  const [groupedSmallMutations, setGroupedSmallMutations] = useState({
    therapeutic: [],
    nostic: [],
    biological: [],
    unknown: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (report) {
      setIsLoading(true);
      const getData = async () => {
        const smallMutationsResp = await api.get(
          `/reports/${report.ident}/small-mutations`,
          {},
        ).request();
        setSmallMutations(smallMutationsResp);
      };
      getData();
    }
  }, [report]);

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

      setIsLoading(false);
      setGroupedSmallMutations(mutations);
    }
  }, [smallMutations]);

  return (
    <div className="small-mutations">
      <Typography variant="h3">
        Small Mutations
      </Typography>
      {!isLoading ? (
        <>
          {Object.entries(groupedSmallMutations).map(([key, value]) => (
            <DataTable
              key={key}
              canToggleColumns
              columnDefs={columnDefs}
              rowData={value}
              titleText={titleMap[key]}
            />
          ))}
        </>
      ) : (
        <LinearProgress />
      )}
    </div>
  );
};

export default SmallMutations;
