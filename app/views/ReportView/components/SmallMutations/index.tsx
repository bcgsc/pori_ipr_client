import React, { useState, useEffect, useContext } from 'react';
import {
  Typography,
} from '@material-ui/core';

import api from '@/services/api';
import DataTable from '@/components/DataTable';
import ReportContext from '@/components/ReportContext';
import { columnDefs } from './columnDefs';

import './index.scss';

const SmallMutations = (): JSX.Element => {
  const { report } = useContext(ReportContext);
  const [smallMutations, setSmallMutations] = useState([]);
  const [therapeutic, setTherapeutic] = useState([]);
  const [nostic, setNostic] = useState([]);
  const [biological, setBiological] = useState([]);
  const [unknown, setUnknown] = useState([]);

  useEffect(() => {
    if (report) {
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

        // Therapeutic? => therapeutic
        if (row.kbMatches.some((m) => m.category === 'therapeutic')) {
          mutations.therapeutic.push(row);
          isUnknown = false;
        }

        // Diagnostic || Prognostic? => nostic
        if (row.kbMatches.some((m) => (m.category === 'diagnostic' || m.category === 'prognostic'))) {
          mutations.nostic.push(row);
          isUnknown = false;
        }

        // Biological ? => Biological
        if (row.kbMatches.some((m) => m.category === 'biological')) {
          mutations.biological.push(row);
          isUnknown = false;
        }

        // Unknown
        if (isUnknown) {
          mutations.unknown.push(row);
        }
      });

      setTherapeutic(mutations.therapeutic);
      setNostic(mutations.nostic);
      setBiological(mutations.biological);
      setUnknown(mutations.unknown);
    }
  }, [smallMutations]);

  return (
    <div className="small-mutations">
      <Typography variant="h3">
        Small Mutations
      </Typography>
      <DataTable
        canToggleColumns
        columnDefs={columnDefs}
        rowData={therapeutic}
        titleText="Variants of Therapeutic Relevance"
      />
      <DataTable
        canToggleColumns
        columnDefs={columnDefs}
        rowData={nostic}
        titleText="Variants of Prognostic or Diagnostic Relevance"
      />
      <DataTable
        canToggleColumns
        columnDefs={columnDefs}
        rowData={biological}
        titleText="Variants of Biological Relevance"
      />
      <DataTable
        canToggleColumns
        columnDefs={columnDefs}
        rowData={unknown}
        titleText="Variants of Unknown Significance"
      />
    </div>
  );
};

export default SmallMutations;
