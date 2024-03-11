import React, {
  useState, useEffect, useContext, useMemo,
} from 'react';
import { Typography } from '@mui/material';

import api from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import useReport from '@/hooks/useReport';
import { SmallMutationType } from '@/common';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import EditDialog from './components/EditDialog';
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
  const { canEdit } = useReport();
  const [smallMutations, setSmallMutations] = useState<SmallMutationType[]>([]);
  const [groupedSmallMutations, setGroupedSmallMutations] = useState({
    therapeutic: [],
    nostic: [],
    biological: [],
    unknown: [],
  });
  const [visibleCols, setVisibleCols] = useState<string[]>(
    columnDefs.reduce((accumulator: string[], current) => {
      if (current.hide === false || !current.hide) {
        accumulator.push(current.field ?? current.colId);
      } return accumulator;
    }, []),
  );

  const [showDialog, setShowDialog] = useState(false);
  const [editData, setEditData] = useState<SmallMutationType | null>();

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const smallMutationsResp = await api.get(
            `/reports/${report.ident}/small-mutations`,
          ).request();

          let filteredSmallMutResp = [];

          // Hide some columns if no values are returned
          if (smallMutationsResp?.length) {
            filteredSmallMutResp = smallMutationsResp.filter(({ germline }) => !germline);
            const nextVisible = [];
            for (const {
              gene: {
                expressionVariants: {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  tpm, rpkm, primarySiteFoldChange,
                },
              },
            } of filteredSmallMutResp) {
              if (rpkm !== null && !nextVisible.includes('rpkm')) {
                nextVisible.push('rpkm');
              }
              if (primarySiteFoldChange !== null && !nextVisible.includes('primarySiteFoldChange')) {
                nextVisible.push('primarySiteFoldChange');
              }
              if (nextVisible.length === 2) {
                break;
              }
            }
            setVisibleCols((prevVal) => [...prevVal, ...nextVisible]);
          }
          setSmallMutations(filteredSmallMutResp);
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

  const handleEditStart = (rowData: SmallMutationType) => {
    setShowDialog(true);
    setEditData(rowData);
  };

  const handleEditClose = () => {
    setShowDialog(false);
    setEditData(null);
  };

  const handleVisibleColsChange = (change) => setVisibleCols(change);

  const dataTables = useMemo(() => Object.entries(groupedSmallMutations).map(([key, value]) => (
    <DataTable
      key={key}
      canToggleColumns
      columnDefs={columnDefs}
      rowData={value}
      titleText={TITLE_MAP[key]}
      syncVisibleColumns={handleVisibleColsChange}
      visibleColumns={visibleCols}
      demoDescription={INFO_BUBBLES[key]}
      canEdit={canEdit}
      onEdit={handleEditStart}
    />
  )), [canEdit, groupedSmallMutations, visibleCols]);

  return (
    <div className="small-mutations">
      {!isLoading && (
        <>
          <Typography variant="h3">
            Small Mutations
          </Typography>
          {showDialog && (
            <EditDialog
              editData={editData}
              isOpen={showDialog}
              onClose={handleEditClose}
              showErrorSnackbar={snackbar.error}
            />
          )}
          { dataTables }
        </>
      )}
    </div>
  );
};

export default withLoading(SmallMutations);
