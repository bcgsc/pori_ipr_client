import React, { useEffect, useState, useContext } from 'react';

import DataTable from '../../../../components/DataTable';
import Image from '../../../../components/Image';
import ReportContext from '../../../../components/ReportContext';
import api, { ApiCallSet } from '../../../../services/api';
import { hlaColumnDefs, cellTypesColumnDefs } from './columnDefs';
import DemoDescription from '@/components/DemoDescription';
import AsyncButton from '@/components/AsyncButton';

const Immune = () => {
  const { report } = useContext(ReportContext);
  const [cellTypes, setCellTypes] = useState<Array<Record<string, unknown>>>([]);
  const [images, setImages] = useState<Record<string, unknown>>({});
  const [hlaTypes, setHlaTypes] = useState<Array<Record<string, unknown>>>([]);

  const [apiCalling, setApiCalling] = useState(false);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const apiCalls = new ApiCallSet([
          api.get(`/reports/${report.ident}/immune-cell-types`, {}),
          api.get(
            `/reports/${report.ident}/image/retrieve/cibersort.combined_t-cell_scatter,cibersort.cd8_positive_t-cell_scatter,mixcr.circos_trb_vj_gene_usage,mixcr.dominiance_vs_alpha_beta_t-cells_scatter`,
            {},
          ),
          api.get(`/reports/${report.ident}/hla-types`, {}),
        ]);

        const [cellTypesResp, imagesResp, hlaTypesResp] = await apiCalls.request();
        setCellTypes(cellTypesResp);
        setImages(imagesResp);
        setHlaTypes(hlaTypesResp);
      };

      getData();
    }
  }, [report]);

  const handleClick = () => {
    setApiCalling(true);
    window.setTimeout(() => setApiCalling(false), 2000);
  };

  return (
    <div>
      <DemoDescription>
        Evidence for immune cells in the tumour sample, potentially representing tumour-infiltrating
        lymphocytes, are predicted based on analysis of expression patterns in RNA data. The total
        T cell score (T.cell.infiltration) represents the total of all T cell scores excluding the
        negative regulatory T cells. The specific HLA alleles found in sequenced samples,
        representing MHC class I types, are predicted based on alignment of DNA and RNA to databases
        of known HLA sequences.
      </DemoDescription>
      <AsyncButton onClick={handleClick} color="secondary" variant="outlined" isLoading={apiCalling}>
        Test Button
      </AsyncButton>
      <DataTable
        columnDefs={cellTypesColumnDefs}
        rowData={cellTypes}
        titleText="Immune Cell Types"
        canViewDetails
      />
      {Object.values(images).length > 0 && (
        <div>
          <Image
            image={images['cibersort.combined_t-cell_scatter']}
            showTitle
            showCaption
            isZoomable
          />
          <Image
            image={images['cibersort.cd8_positive_t-cell_scatter']}
            showTitle
            showCaption
            isZoomable
          />
        </div>
      )}
      <DataTable
        columnDefs={hlaColumnDefs}
        rowData={hlaTypes}
        titleText="HLA Types"
        canViewDetails
      />
      {Object.values(images).length > 0 && (
        <div>
          <Image
            image={images['mixcr.circos_trb_vj_gene_usage']}
            showTitle
            showCaption
            isZoomable
          />
          <Image
            image={images['mixcr.dominance_vs_alpha_beta_t-cells_scatter']}
            showTitle
            showCaption
            isZoomable
          />
        </div>
      )}
    </div>
  );
};

export default Immune;
