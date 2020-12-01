import React, {
  useEffect, useState, useContext,
} from 'react';
import {
  Typography,
  LinearProgress,
} from '@material-ui/core';

import ReportContext from '../../../../components/ReportContext';
import ImageService from '../../../../services/reports/image.service';
import { getComparators } from '../../../../services/reports/comparators';
import { getMutationBurden } from '../../../../services/reports/mutation-burden';
import { imageType, comparatorType, mutationBurdenType } from './types';
import TabCards from './components/TabCards';

import './index.scss';

const processImages = (images: Record<string, imageType>): Record<string, Record<string, imageType[]>> => {
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

    Object.values(images).forEach((image) => {
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

  const [images, setImages] = useState<Record<string, Record<string, imageType[]>>>();
  const [comparators, setComparators] = useState<comparatorType[]>([]);
  const [mutationBurden, setMutationBurden] = useState<mutationBurdenType[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const [imagesResp, comparatorsResp, mutationBurdenResp] = await Promise.all([
          ImageService.mutationBurden(report.ident),
          getComparators(report.ident),
          getMutationBurden(report.ident),
        ]);
        setImages(processImages(imagesResp));
        setComparators(comparatorsResp);
        setMutationBurden(mutationBurdenResp);
        setIsLoading(false);
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
    </div>
  );
};

export default MutationBurden;
