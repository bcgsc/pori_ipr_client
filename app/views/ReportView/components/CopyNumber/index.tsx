import React, { useEffect, useState, useContext } from 'react';
import {
  Typography,
  LinearProgress,
} from '@material-ui/core';

import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import api, { ApiCallSet } from '@/services/api';
import { CNVSTATE, EXPLEVEL } from '@/constants';
import Image from '@/components/Image';
import ImageType from '@/components/Image/types';
import CopyNumberType from './types';
import columnDefs from './columnDefs';

import './index.scss';

const titleMap = {
  clinical: 'CNVs of Potential Clinical Relevance',
  nostic: 'CNVs of Prognostic or Diagnostic Relevance',
  biological: 'CNVs of Biological Relevance',
  amplifications: 'Commonly Amplified Oncogenes with Copy Gains',
  deletions: 'Homozygously Deleted Tumour Suppressors',
  highExp: 'Highly Expressed Oncogenes with Copy Gains',
  lowExp: 'Lowly Expressed Tumour Suppressors with Copy Losses',
};

const CopyNumber = (): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [isLoading, setIsLoading] = useState(true);
  const [images, setImages] = useState<ImageType[]>([]);
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

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const apiCalls = new ApiCallSet([
          api.get(`/reports/${report.ident}/copy-variants`, {}),
          api.get(`/reports/${report.ident}/image/retrieve/cnvLoh.circos,cnv.1,cnv.2,cnv.3,cnv.4,cnv.5,loh.1,loh.2,loh.3,loh.4,loh.5`, {}),
        ]);
        const [cnvsResp, imagesResp] = await apiCalls.request();
        setCnvs(cnvsResp);
        setImages(imagesResp);
        setIsLoading(false);
      };
      getData();
    }
  }, [report]);

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

  return (
    <div className="copy-number">
      <Typography variant="h3">Copy Number Analyses</Typography>
      {!isLoading ? (
        <>
          <Typography variant="h3" className="copy-number__title">Summary of Copy Number Events</Typography>
          <div className="copy-number__circos">
            <Image
              image={images.find((img) => img.key === 'cnvLoh.circos')}
              width={700}
            />
          </div>
          {groupedCnvs && (
            <>
              {Object.entries(groupedCnvs).map(([key, value]) => (
                <React.Fragment key={key}>
                  <DataTable
                    canToggleColumns
                    columnDefs={columnDefs}
                    rowData={value}
                    titleText={titleMap[key]}
                  />
                </React.Fragment>
              ))}
            </>
          )}
          <Typography variant="h3" className="copy-number__title">Copy Number & LOH</Typography>
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
        </>
      ) : (
        <LinearProgress />
      )}
    </div>
  );
};

export default CopyNumber;
