import React, { useState, useEffect, useContext } from 'react';
import {
  Typography,
  Grid,
} from '@material-ui/core';

import api, { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import ReadOnlyTextField from '@/components/ReadOnlyTextField';
import { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import { AppendicesType, TcgaType, ComparatorType } from './types';
import { sampleInformationColumnDefs, sequencingProtocolInformationColumnDefs, tcgaAcronymsColumnDefs } from './columnDefs';
import GenomicReportOverview from './components/GenomicReportOverview';
import ProbeReportOverview from './components/ProbeReportOverview';
import ConfigTable from './components/ConfigTable';

import './index.scss';

type AppendicesProps = {
  isProbe: boolean;
  isPrint: boolean;
  loadedDispatch: (section: { type: string }) => void;
} & WithLoadingInjectedProps;

const Appendices = ({
  isProbe,
  isPrint,
  loadedDispatch,
  isLoading,
  setIsLoading,
}: AppendicesProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [comparators, setComparators] = useState<ComparatorType[]>([]);
  const [appendices, setAppendices] = useState<AppendicesType>();
  const [tcga, setTcga] = useState<TcgaType[]>([]);
  const [analysisSummary, setAnalysisSummary] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const callSet = new ApiCallSet([
            api.get(`/reports/${report.ident}/appendices`, {}),
            api.get(`/reports/${report.ident}/appendices/tcga`, {}),
            api.get(`/reports/${report.ident}/comparators`, {}),
          ]);
          const [appendicesResp, tcgaResp, comparatorsResp] = await callSet.request();

          setAppendices(appendicesResp);
          setTcga(tcgaResp);
          setComparators(comparatorsResp);
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
          if (loadedDispatch) {
            loadedDispatch({ type: 'appendices' });
          }
        }
      };

      getData();
    }
  }, [loadedDispatch, report, setIsLoading]);

  useEffect(() => {
    if (report && comparators.length) {
      const normalComparator = comparators.find(({ analysisRole }) => analysisRole === 'expression (primary site)');
      const diseaseComparator = comparators.find(({ analysisRole }) => analysisRole === 'expression (disease)');

      setAnalysisSummary([
        {
          label: 'Constitutional Protocol',
          value: report.patientInformation.constitutionalProtocol,
        },
        {
          label: 'Constitutional Sample',
          value: report.patientInformation.constitutionalSample,
        },
        {
          label: 'Normal Comparator',
          value: normalComparator ? normalComparator.name : 'Not specified',
        },
        {
          label: 'Disease Comparator',
          value: diseaseComparator ? diseaseComparator.name : 'Not specified',
        },
        {
          label: 'Ploidy Model',
          value: report.ploidy,
        },
      ]);
    }
  }, [comparators, report]);

  return (
    <div className="appendices">
      {!isLoading && (
        <>
          {!isPrint && (
            <>
              <Typography variant="h1">
                Appendix A
              </Typography>
              <div className="analysis-summary">
                <Typography variant="h3">
                  Analysis Summary
                </Typography>
                <Grid
                  alignItems="flex-end"
                  container
                  spacing={3}
                  className="analysis-summary__content"
                >
                  {analysisSummary.map(({ label, value }) => (
                    <Grid key={label as string} item>
                      <ReadOnlyTextField label={label}>
                        {value}
                      </ReadOnlyTextField>
                    </Grid>
                  ))}
                </Grid>
              </div>
              {appendices?.sampleInfo && (
                <DataTable
                  columnDefs={sampleInformationColumnDefs}
                  rowData={appendices.sampleInfo}
                  titleText="Sample Information"
                />
              )}
              {appendices?.seqQC && (
                <DataTable
                  columnDefs={sequencingProtocolInformationColumnDefs}
                  rowData={appendices.seqQC}
                  titleText="Sequencing Protocol Information"
                />
              )}
              <Typography variant="h1">
                Appendix B
              </Typography>
              {Boolean(tcga.length) && (
                <DataTable
                  columnDefs={tcgaAcronymsColumnDefs}
                  rowData={tcga}
                  titleText="TCGA Acronyms"
                />
              )}
            </>
          )}
          {!isPrint && (
            <Typography variant="h1">
              Appendix C
            </Typography>
          )}
          {isPrint && (
            <div className="analysis-summary">
              <Typography variant="h3">
                Analysis Summary
              </Typography>
              <Grid
                alignItems="flex-end"
                container
                spacing={3}
                className="analysis-summary__content"
              >
                {analysisSummary.map(({ label, value }) => (
                  <Grid key={label as string} item>
                    <ReadOnlyTextField label={label}>
                      {value}
                    </ReadOnlyTextField>
                  </Grid>
                ))}
              </Grid>
            </div>
          )}
          {isProbe ? (
            <ProbeReportOverview />
          ) : (
            <GenomicReportOverview />
          )}
          {!isPrint && (
            <Typography variant="h1">
              Appendix D
            </Typography>
          )}
          {/* Config is disabled in print reports for now due to feedback */}
          {appendices?.config && !isPrint && (
            <div className="appendices__config">
              <strong>
                {`Genomic Report ${report.reportVersion}/${report.kbVersion}`}
              </strong>
              <ConfigTable
                config={appendices.config}
                isPrint={isPrint}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Appendices;
