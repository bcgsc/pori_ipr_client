import React, { useEffect, useState, useContext } from 'react';

import DemoDescription from '@/components/DemoDescription';
import DataTable from '@/components/DataTable';
import Image, { ImageType } from '@/components/Image';
import ReportContext from '@/context/ReportContext';
import api, { ApiCallSet } from '@/services/api';
import snackbar from '@/services/SnackbarUtils';
import withLoading, { WithLoadingInjectedProps } from '@/hoc/WithLoading';
import { hlaColumnDefs, cellTypesColumnDefs } from './columnDefs';
import { ImmuneType, HlaType } from './types';

import './index.scss';

const IMAGE_KEYS = [
  'cibersort.combined_t-cell_scatter',
  'cibersort.cd8_positive_t-cell_scatter',
  'mixcr.circos_trb_vj_gene_usage',
  'mixcr.dominiance_vs_alpha_beta_t-cells_scatter',
];

type ImmuneProps = WithLoadingInjectedProps;

const Immune = ({
  isLoading,
  setIsLoading,
}: ImmuneProps): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [cellTypes, setCellTypes] = useState<ImmuneType[]>([]);
  const [images, setImages] = useState<ImageType[]>([]);
  const [hlaTypes, setHlaTypes] = useState<HlaType[]>([]);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const apiCalls = new ApiCallSet([
            api.get(`/reports/${report.ident}/immune-cell-types`),
            api.get(
              `/reports/${report.ident}/image/retrieve/${IMAGE_KEYS.join(',')}`,
            ),
            api.get(`/reports/${report.ident}/hla-types`),
          ]);

          const [cellTypesResp, imagesResp, hlaTypesResp] = await apiCalls.request();
          setCellTypes(cellTypesResp);
          setImages(imagesResp);
          setHlaTypes(hlaTypesResp);
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };

      getData();
    }
  }, [report, setIsLoading]);

  return (
    <div>
      {!isLoading && (
        <>
          <DemoDescription>
            Evidence for immune cells in the tumour sample, potentially representing tumour-infiltrating
            lymphocytes, are predicted based on analysis of expression patterns in RNA data. The total
            T cell score (T.cell.infiltration) represents the total of all T cell scores excluding the
            negative regulatory T cells. The specific HLA alleles found in sequenced samples,
            representing MHC class I types, are predicted based on alignment of DNA and RNA to databases
            of known HLA sequences.
          </DemoDescription>
          <DataTable
            columnDefs={cellTypesColumnDefs}
            rowData={cellTypes}
            titleText="Immune Cell Types"
            canViewDetails
          />
          {Boolean(images.length) && (
            <div className="immune__images">
              <Image
                height={500}
                image={images.find(({ key }) => key === 'cibersort.cd8_positive_t-cell_scatter')}
                isZoomable
                showCaption
                showTitle
                width={500}
              />
              <Image
                height={500}
                image={images.find(({ key }) => key === 'cibersort.combined_t-cell_scatter')}
                isZoomable
                showCaption
                showTitle
                width={500}
              />
            </div>
          )}
          <DataTable
            columnDefs={hlaColumnDefs}
            rowData={hlaTypes}
            titleText="HLA Types"
            canViewDetails
          />
          {Boolean(images.length) && (
            <div className="immune__images">
              <Image
                height={500}
                image={images.find(({ key }) => key === 'mixcr.circos_trb_vj_gene_usage')}
                isZoomable
                showCaption
                showTitle
                width={500}
              />
              <Image
                height={500}
                image={images.find(({ key }) => key === 'mixcr.dominance_vs_alpha_beta_t-cells_scatter')}
                isZoomable
                showCaption
                showTitle
                width={500}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default withLoading(Immune);
