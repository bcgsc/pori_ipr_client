import React, {
  useEffect, useState, useContext,
} from 'react';
import {
  Typography,
  LinearProgress,
  Card,
  CardHeader,
  CardContent,
  Tabs,
  Tab,
} from '@material-ui/core';

import ReportContext from '../../../../components/ReportContext';
import ImageService from '../../../../services/reports/image.service';
import { getComparators } from '../../../../services/reports/comparators';
import { getMutationBurden } from '../../../../services/reports/mutation-burden';
import Image from '../../../../components/Image';
import { imageType, comparatorType, mutationBurdenType } from './types';

import './index.scss';

const processImages = (images: Record<string, imageType>): Record<string, Record<string, Record<string, imageType>[]>> => {
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

const rankMapping = {
  primary: 0,
  secondary: 1,
  tertiary: 2,
  quaternary: 3,
};

const MutationBurden = (): JSX.Element => {
  const { report } = useContext(ReportContext);

  const [images, setImages] = useState<Record<string, Record<string, Record<string, imageType>[]>>>();
  const [comparators, setComparators] = useState<comparatorType[]>([]);
  const [mutationBurden, setMutationBurden] = useState<mutationBurdenType[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [snvTabValue, setSnvTabValue] = useState<number>(0);
  const [indelTabValue, setIndelTabValue] = useState<number>(0);
  const [svTabValue, setSvTabValue] = useState<number>(0);

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

  const handleTabChange = (event, value: number, type: string): void => {
    switch (type) {
      case 'SNV':
        setSnvTabValue(value);
        break;
      case 'Indel':
        setIndelTabValue(value);
        break;
      case 'SV':
        setSvTabValue(value);
        break;
      default:
        break;
    }
  };

  const getTabValue = (type: string): number => {
    switch (type) {
      case 'SNV':
        return snvTabValue;
      case 'Indel':
        return indelTabValue;
      case 'SV':
        return svTabValue;
      default:
        return 0;
    }
  };

  const getImages = (imageGroup, role) => {
    const foundImages = [];

    imageGroup.forEach((img) => {
      const imgRole = img.key.split('.')[2] || '';
      if (role.toLowerCase() === imgRole.toLowerCase()) {
        foundImages.push(img);
      }
    });
    return foundImages;
  };

  const getCardContent = (burden, type) => {
    switch (type) {
      case 'SNV':
        return (
          <>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              <>
                Protein Coding SNVs (count):
                {` ${burden.codingSnvCount}`}
              </>
            </Typography>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              <>
                Protein Coding SNVs (percentile):
                {` ${burden.codingSnvPercentile}`}
              </>
            </Typography>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              <>
                Truncating Protein Coding SNVs (count):
                {` ${burden.truncatingSnvCount}`}
              </>
            </Typography>
          </>
        );
      case 'Indel':
        return (
          <>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              <>
                Protein Coding Indels (count):
                {` ${burden.codingIndelsCount}`}
              </>
            </Typography>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              <>
                Protein Coding Indels (percentile):
                {` ${burden.codingIndelPercentile}`}
              </>
            </Typography>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              <>
                Frameshifting Protein Coding Indels (count):
                {` ${burden.frameshiftIndelsCount}`}
              </>
            </Typography>
          </>
        );
      case 'SV':
        return (
          <>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              <>
                Structural Variants (count):
                {` ${burden.qualitySvCount}`}
              </>
            </Typography>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              <>
                Structural Variants (percentile):
                {` ${burden.qualitySvPercentile}`}
              </>
            </Typography>
            <Typography variant="body2" className="mutation-burden__comparator--padded">
              <>
                Expressed Structural Variants (count):
                {` ${burden.qualitySvExpressedCount}`}
              </>
            </Typography>
          </>
        );
      default:
        console.error(`Bad card type found: ${type}`);
        return null;
    }
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
                    {`${type}`}
                  </Typography>
                </div>
                <div className="mutation-burden__tab-control">
                  <Tabs value={getTabValue(type)} onChange={(event, value) => handleTabChange(event, value, type)}>
                    {comparators
                      .filter(({ analysisRole }) => analysisRole.includes('mutation burden'))
                      .map(({ analysisRole }) => {
                        const [roleName] = analysisRole.match(/(?<=\().+(?=\))/g);

                        return (
                          <Tab key={analysisRole} label={roleName} />
                        );
                      })}
                  </Tabs>
                </div>
                <div className="mutation-burden__images">
                  {comparators
                    .filter(({ analysisRole }) => analysisRole.includes('mutation burden'))
                    .map(({ analysisRole, name }) => {
                      if (type === 'SV'
                        && comparators.some(({ analysisRole: role }) => role.includes('mutation burden SV'))
                        && !analysisRole.includes('mutation burden SV')) {
                        return null;
                      }
                      const [roleName] = analysisRole.match(/(?<=\().+(?=\))/g);
                      const mutationBurdenRole = mutationBurden.find(({ role }) => role === roleName);

                      const barplotsByRole = getImages(barplots, roleName);
                      const densitiesByRole = getImages(densities, roleName);
                      const legendsByRole = getImages(legends, roleName);

                      return (
                        <>
                          {rankMapping[roleName] === getTabValue(type) && (
                            <Card key={name} elevation={3} className="mutation-burden__group">
                              <CardHeader title={`Comparator: ${name} (${roleName})`} />
                              {Boolean(barplotsByRole.length) && barplotsByRole.map(plot => (
                                <span key={plot.key} className="mutation-burden__image">
                                  <Image
                                    image={plot}
                                    showTitle
                                    showCaption
                                  />
                                </span>
                              ))}
                              {Boolean(densitiesByRole.length) && densitiesByRole.map((plot, index) => (
                                <span key={plot.key} className="mutation-burden__pair">
                                  <Typography>{plot.title}</Typography>
                                  <Image image={plot} />
                                  {legendsByRole[index] && (
                                    <Image image={legendsByRole[index]} />
                                  )}
                                  <Typography>{plot.caption}</Typography>
                                </span>
                              ))}
                              {mutationBurdenRole && (
                                <CardContent>
                                  {getCardContent(mutationBurdenRole, type)}
                                </CardContent>
                              )}
                            </Card>
                          )}
                        </>
                      );
                    })}
                </div>
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
