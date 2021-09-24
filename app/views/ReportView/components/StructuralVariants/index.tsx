import React, { useState, useEffect, useContext } from 'react';
import {
  Typography,
  Tabs,
  Tab,
} from '@material-ui/core';

import api, { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import DataTable from '@/components/DataTable';
import Image from '@/components/Image';
import ReportContext from '@/context/ReportContext';
import ImageType from '@/components/Image/types';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import columnDefs from './columnDefs';
import StructuralVariantType from './types';

import './index.scss';

const TITLE_MAP = {
  therapeutic: 'Gene Fusions of Potential Therapeutic Relevance',
  nostic: 'Gene Fusions of Prognostic or Diagnostic Relevance',
  biological: 'Gene Fusions of Biological Relevance',
  unknown: 'Structural Variants of Unknown Significance',
};

const getInfoDescription = (relevance: string) => `Structural variants where the mutation matched 1 or more statements of ${relevance} relevance in the knowledge base matches section. Details on these matches can be seen in the knowledge base matches section of this report.`;

const INFO_BUBBLES = {
  biological: getInfoDescription('biological'),
  nostic: getInfoDescription('prognostic or diagnostic'),
  therapeutic: getInfoDescription('therapeutic'),
  unknown: 'Structural variants where the mutation did not match any knowledge base statements of therapeutic, biological, diagnostic, or prognostic relevance.',
};

type StructuralVariantsProps = WithLoadingInjectedProps;

const StructuralVariants = ({
  isLoading,
  setIsLoading,
}: StructuralVariantsProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [svs, setSvs] = useState<StructuralVariantType[]>([]);
  const [groupedSvs, setGroupedSvs] = useState({
    therapeutic: [],
    nostic: [],
    biological: [],
    unknown: [],
  });

  const [genomeCircos, setGenomeCircos] = useState<ImageType>();
  const [transcriptomeCircos, setTranscriptomeCircos] = useState<ImageType>();
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const apiCalls = new ApiCallSet([
            api.get(`/reports/${report.ident}/structural-variants`),
            api.get(`/reports/${report.ident}/image/retrieve/circosSv.genome,circosSv.transcriptome`),
          ]);
          const [svsResp, imagesResp] = await apiCalls.request();

          setSvs(svsResp);
          setGenomeCircos(imagesResp.find((img: ImageType) => img.key === 'circosSv.genome'));
          setTranscriptomeCircos(imagesResp.find((img: ImageType) => img.key === 'circosSv.transcriptome'));
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };
      getData();
    }
  }, [report, setIsLoading]);

  // Categorize variants
  useEffect(() => {
    if (svs.length) {
      const variants = {
        therapeutic: [],
        nostic: [],
        biological: [],
        unknown: [],
      };

      svs.forEach((row) => {
        let isUnknown = true;

        if (row.kbMatches.some((m) => m.category === 'therapeutic')) {
          variants.therapeutic.push(row);
          isUnknown = false;
        }

        if (row.kbMatches.some((m) => (m.category === 'diagnostic' || m.category === 'prognostic'))) {
          variants.nostic.push(row);
          isUnknown = false;
        }

        if (row.kbMatches.some((m) => m.category === 'biological')) {
          variants.biological.push(row);
          isUnknown = false;
        }

        if (isUnknown) {
          variants.unknown.push(row);
        }
      });

      setGroupedSvs(variants);
    }
  }, [svs]);

  const handleTabChange = (event: React.ChangeEvent<HTMLInputElement>, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <div className="structural-variants">
      <Typography variant="h3">Structural Variation</Typography>
      {!isLoading && (
        <>
          <Typography variant="h3" className="structural-variants__title">
            Summary of Structural Events
          </Typography>
          {(genomeCircos || transcriptomeCircos) ? (
            <>
              <Tabs centered value={tabIndex} onChange={handleTabChange}>
                <Tab label="genome" />
                <Tab label="transcriptome" />
              </Tabs>
              {tabIndex === 0 && (
                <>
                  {genomeCircos ? (
                    <div className="structural-variants__events">
                      <Image image={genomeCircos} />
                    </div>
                  ) : (
                    <Typography align="center">No Genomic Circos Plot Available</Typography>
                  )}
                </>
              )}
              {tabIndex === 1 && (
                <>
                  {transcriptomeCircos ? (
                    <div className="structural-variants__events">
                      <Image image={transcriptomeCircos} />
                    </div>
                  ) : (
                    <Typography align="center">No Transcriptome Circos Plot Available</Typography>
                  )}
                </>
              )}
            </>
          ) : (
            <Typography align="center">No Circos Plots Available</Typography>
          )}
          {Object.entries(groupedSvs).map(([key, value]) => (
            <DataTable
              key={key}
              columnDefs={columnDefs}
              rowData={value}
              titleText={TITLE_MAP[key]}
              canToggleColumns
              demoDescription={INFO_BUBBLES[key]}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default withLoading(StructuralVariants);
