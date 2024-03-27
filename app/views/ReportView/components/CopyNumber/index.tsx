import React, {
  useEffect, useState, useContext, useMemo,
} from 'react';
import {
  Typography,
  useTheme,
} from '@mui/material';

import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import useReport from '@/hooks/useReport';
import api, { ApiCallSet } from '@/services/api';
import { CNVSTATE, EXPLEVEL } from '@/constants';
import Image from '@/components/Image';
import ImageType from '@/components/Image/types';
import snackbar from '@/services/SnackbarUtils';
import { CopyNumberType } from '@/common';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import VariantEditDialog from '@/components/VariantEditDialog';
import columnDefs from './columnDefs';

import './index.scss';

const TITLE_MAP = {
  clinical: 'CNVs of Potential Therapeutic Relevance',
  nostic: 'CNVs of Prognostic or Diagnostic Relevance',
  biological: 'CNVs of Biological Relevance',
  amplifications: 'Commonly Amplified Oncogenes with Copy Gains',
  deletions: 'Homozygously Deleted Tumour Suppressors',
  highExp: 'Highly Expressed Oncogenes with Copy Gains',
  lowExp: 'Lowly Expressed Tumour Suppressors with Copy Losses',
};

const getInfoDescription = (relevance: string) => `Copy variants where the variant matched 1 or
 more statements of ${relevance} relevance in the knowledge base matches section. Details on these
 matches can be seen in the knowledge base matches section of this report.`;

const INFO_BUBBLES = {
  biological: getInfoDescription('biological'),
  nostic: getInfoDescription('prognostic or diagnostic'),
  clinical: getInfoDescription('therapeutic'),
  amplifications: 'Copy number amplifications in known oncogenes.',
  deletions: 'Homozygous (deep) deletions in known tumour supressor genes.',
  highExp: 'Copy number gains in known oncogenes which are also highly expressed',
  lowExp: 'Copy number losses in known tumour supressor genes which are also lowly expressed.',
};

type CopyNumberProps = WithLoadingInjectedProps;

const CopyNumber = ({
  isLoading,
  setIsLoading,
}: CopyNumberProps): JSX.Element => {
  const { report } = useContext(ReportContext);
  const { canEdit } = useReport();
  const theme = useTheme();
  const [images, setImages] = useState<ImageType[]>([]);
  const [circos, setCircos] = useState<ImageType>();
  const [cnvs, setCnvs] = useState<CopyNumberType[]>([]);
  const [groupedCnvs, setGroupedCnvs] = useState({
    clinical: [],
    nostic: [],
    biological: [],
    amplifications: [],
    deletions: [],
    highExp: [],
    lowExp: [],
  });
  const [visibleCols, setVisibleCols] = useState<string[]>(
    columnDefs.reduce((accumulator: string[], current) => {
      if (current.hide === false || !current.hide) {
        accumulator.push(current.field ?? current.colId);
      } return accumulator;
    }, []),
  );
  const [showDialog, setShowDialog] = useState(false);
  const [editData, setEditData] = useState<CopyNumberType | null>();

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const apiCalls = new ApiCallSet([
            api.get(`/reports/${report.ident}/copy-variants`),
            api.get(`/reports/${report.ident}/image/retrieve/cnvLoh.circos,cnv.1,cnv.2,cnv.3,cnv.4,cnv.5,loh.1,loh.2,loh.3,loh.4,loh.5`),
          ]);
          const [cnvsResp, imagesResp] = await apiCalls.request() as [CopyNumberType[], ImageType[]];

          if (cnvsResp?.length) {
            const nextVisible = [];
            for (const {
              gene: {
                expressionVariants: {
                  rpkm, primarySiteFoldChange,
                },
              },
            } of cnvsResp) {
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

          const circosIndex = imagesResp.findIndex((img) => img.key === 'cnvLoh.circos');
          const [circosResp] = imagesResp.splice(circosIndex, 1);

          setCnvs(cnvsResp);
          setCircos(circosResp);
          setImages(imagesResp);
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };
      getData();
    }
  }, [report, setIsLoading]);

  useEffect(() => {
    if (cnvs.length) {
      const groups = {
        clinical: [],
        nostic: [],
        biological: [],
        amplifications: [],
        deletions: [],
        highExp: [],
        lowExp: [],
      };

      cnvs.forEach((row) => {
        const {
          gene: {
            tumourSuppressor,
            oncogene,
            expressionVariants: { expressionState },
          },
        } = row;
        const cnvState = row.cnvState.toLowerCase();

        if (tumourSuppressor) {
          // homod?
          if (CNVSTATE.HOMLOSS.includes(cnvState)) {
            groups.deletions.push(row);
          }
          // low exp, copy loss
          if (CNVSTATE.LOSS.includes(cnvState) && EXPLEVEL.OUT_LOW.includes(cnvState)) {
            groups.lowExp.push(row);
          }
        }

        if (oncogene) {
          // Common amplified + Copy gains?
          if (CNVSTATE.AMP.includes(cnvState)) {
            groups.amplifications.push(row);
          }
          // Highly expressed + Copy gains?
          if (CNVSTATE.GAIN.includes(cnvState) && EXPLEVEL.OUT_HIGH.includes(expressionState)) {
            groups.highExp.push(row);
          }
        }

        // KB-matches
        // Therapeutic? => clinical
        if (row.kbMatches.some((m) => m.category === 'therapeutic')) {
          groups.clinical.push(row);
        }

        // Diagnostic || Prognostic? => nostic
        if (row.kbMatches.some((m) => m.category === 'diagnostic' || m.category === 'prognostic')) {
          groups.nostic.push(row);
        }

        // Biological ? => Biological
        if (row.kbMatches.some((m) => m.category === 'biological')) {
          groups.biological.push(row);
        }
      });
      setGroupedCnvs(groups);
    }
  }, [cnvs]);

  const COPY_NUMBER_VAR_IMG_STYLE = useMemo(() => ({
    maxHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight as number * 3}px)`,
  }), [theme.mixins?.toolbar?.minHeight]);

  const handleEditStart = (rowData: CopyNumberType) => {
    setShowDialog(true);
    setEditData(rowData);
  };

  const handleEditClose = () => {
    setShowDialog(false);
    setEditData(null);
  };

  const handleVisibleColsChange = (change) => setVisibleCols(change);

  return (
    <div className="copy-number">
      <Typography variant="h3">Copy Number Analyses</Typography>
      {!isLoading && (
        <>
          <Typography variant="h3" className="copy-number__title">Summary of Copy Number Events</Typography>
          {showDialog && (
            <VariantEditDialog
              editData={editData}
              variantType="cnv"
              isOpen={showDialog}
              onClose={handleEditClose}
              showErrorSnackbar={snackbar.error}
            />
          )}
          {circos ? (
            <div className="copy-number__circos">
              <Image
                image={circos}
                width={700}
                imgStyle={COPY_NUMBER_VAR_IMG_STYLE}
              />
            </div>
          ) : (
            <Typography align="center">No Circos Plot Available</Typography>
          )}
          {groupedCnvs && (
            <>
              {Object.entries(groupedCnvs).map(([key, value]) => (
                <React.Fragment key={key}>
                  <DataTable
                    canToggleColumns
                    columnDefs={columnDefs}
                    rowData={value}
                    titleText={TITLE_MAP[key]}
                    demoDescription={INFO_BUBBLES[key]}
                    visibleColumns={visibleCols}
                    syncVisibleColumns={handleVisibleColsChange}
                    canEdit={canEdit}
                    onEdit={handleEditStart}
                  />
                </React.Fragment>
              ))}
            </>
          )}
          <Typography variant="h3" className="copy-number__title">Copy Number &amp; LOH</Typography>
          {images.length ? (
            <div className="copy-number__graphs">
              {[...Array(5).keys()].map((index) => (
                <React.Fragment key={index + 1}>
                  <Image
                    image={images.find((img) => img.key === `cnv.${index + 1}`)}
                  />
                  <Image
                    image={images.find((img) => img.key === `loh.${index + 1}`)}
                  />
                </React.Fragment>
              ))}
            </div>
          ) : (
            <Typography align="center">No Copy Number &amp; LOH Plots Available</Typography>
          )}
        </>
      )}
    </div>
  );
};

export default withLoading(CopyNumber);
