import React, {
  useEffect, useState, useContext,
} from 'react';
import {
  Typography,
  LinearProgress,
} from '@material-ui/core';

import DemoDescription from '@/components/DemoDescription';
import DataTable from '@/components/DataTable';
import ReportContext from '@/context/ReportContext';
import snackbar from '@/services/SnackbarUtils';
import Image from '@/components/Image';
import ImageType from '@/components/Image/types';
import api, { ApiCallSet } from '@/services/api';
import {
  ComparatorType, MutationBurdenType, MsiType,
} from './types';
import TabCards from './components/TabCards';
import columnDefs from './columnDefs';

import './index.scss';

const processImages = (images: ImageType[]): Record<string, Record<string, ImageType[]>> => {
  if (images) {
    const keyedImages = {
      indel: {
        density: [],
        barplot: [],
        legend: [],
      },
      sv: {
        density: [],
        barplot: [],
        legend: [],
      },
      snv: {
        density: [],
        barplot: [],
        legend: [],
      },
    };

    images.forEach((image) => {
      const key = image.key.toLowerCase();

      if (key.includes('barplot')) {
        if (key.includes('indel')) {
          keyedImages.indel.barplot.push(image);
        }

        if (key.includes('snv')) {
          keyedImages.snv.barplot.push(image);
        }

        if (key.includes('sv')) {
          keyedImages.sv.barplot.push(image);
        }
      }

      if (key.includes('density')) {
        if (key.includes('indel')) {
          keyedImages.indel.density.push(image);
        }

        if (key.includes('snv')) {
          keyedImages.snv.density.push(image);
        }

        if (key.includes('sv')) {
          keyedImages.sv.density.push(image);
        }
      }

      if (key.includes('legend')) {
        if (key.includes('indel') || key.includes('snv')) {
          keyedImages.snv.legend.push(image);
          keyedImages.indel.legend.push(image);
        }

        if (key.includes('sv')) {
          keyedImages.sv.legend.push(image);
        }
      }
    });
    return keyedImages;
  }
  return {};
};

const MutationBurden = (): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [images, setImages] = useState<Record<string, Record<string, ImageType[]>>>();
  const [comparators, setComparators] = useState<ComparatorType[]>([]);
  const [mutationBurden, setMutationBurden] = useState<MutationBurdenType[]>([]);
  const [msi, setMsi] = useState<MsiType[]>([]);
  const [msiScatter, setMsiScatter] = useState<ImageType>();

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        try {
          const calls = new ApiCallSet([
            api.get(`/reports/${report.ident}/msi`, {}),
            api.get(`/reports/${report.ident}/image/retrieve/msi.scatter`, {}),
            api.get(`/reports/${report.ident}/image/mutation-burden`, {}),
            api.get(`/reports/${report.ident}/comparators`, {}),
            api.get(`/reports/${report.ident}/mutation-burden`, {}),
          ]);
          const [
            msiResp, msiScatterResp, imagesResp, comparatorsResp, mutationBurdenResp,
          ] = await calls.request();
          setMsi(msiResp);
          setMsiScatter(msiScatterResp.find((img) => img.key === 'msi.scatter'));
          setImages(processImages(imagesResp));
          setComparators(comparatorsResp);
          setMutationBurden(mutationBurdenResp);
        } catch (err) {
          snackbar.error(`Network error: ${err}`);
        } finally {
          setIsLoading(false);
        }
      };

      getData();
    }
  }, [report]);

  const getSectionHeader = (type) => {
    if (type === 'SNV') {
      return 'Single Nucleotide Variants (SNV)';
    }
    if (type === 'Indel') {
      return 'Insertions/Deletions (Indel)';
    }
    return 'Structural Variants (SV)';
  };

  return (
    <div className="mutation-burden">
      <Typography variant="h3">
        Mutation Burden
      </Typography>
      <DemoDescription>
        This is reported in mutations per megabase in the genome. Additionally, the number of
        protein coding alterations of each type are totaled and compared to other tumours of a
        similar type. When a suitable tumour-specific cohort is not available for comparison,
        these are compared to an “average” cohort which is not tumour type specific but rather
        composed of all tumour types.
      </DemoDescription>
      {Boolean(comparators.length) && Boolean(mutationBurden.length) && images && (
        <div className="mutation-burden__content">
          {['SNV', 'Indel', 'SV'].map((type) => {
            const barplots = images[type.toLowerCase()].barplot;
            const densities = images[type.toLowerCase()].density;
            const legends = images[type.toLowerCase()].legend;

            return (
              <React.Fragment key={type}>
                <div className="mutation-burden__comparator">
                  <Typography variant="h3">
                    {getSectionHeader(type)}
                  </Typography>
                </div>
                <TabCards
                  type={type}
                  comparators={comparators}
                  mutationBurden={mutationBurden}
                  barplots={barplots}
                  densities={densities}
                  legends={legends}
                />
              </React.Fragment>
            );
          })}
        </div>
      )}
      {isLoading && (
        <LinearProgress />
      )}
      {(!comparators.length || !mutationBurden.length || !images) && !isLoading && (
        <div>
          <Typography variant="h5" align="center">
            No Mutation Burden data found
          </Typography>
        </div>
      )}
      <Typography variant="h3">
        Microsatellite Instability
      </Typography>
      {msiScatter && (
        <div className="msi__image">
          <Image
            image={msiScatter}
            showCaption
            width={500}
          />
        </div>
      )}
      <DataTable
        titleText="MSI Scores"
        rowData={msi}
        columnDefs={columnDefs}
      />
    </div>
  );
};

export default MutationBurden;
