import React, { useEffect, useState, useCallback, useContext } from 'react';
import {
  Typography,
  LinearProgress,
  Card,
  CardContent,
} from '@material-ui/core';
import ReportContext from '../../../../components/ReportContext';
import ImageService from '@/services/reports/image.service';
import { getComparators } from '@/services/reports/comparators';
import { getMutationBurden } from '@/services/reports/mutation-burden';
import Image from '../../../../components/Image';

import './index.scss';

const processImages = (images) => {
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

const MutationBurden = () => {
  const { report } = useContext(ReportContext);
  const [images, setImages] = useState();
  const [comparators, setComparators] = useState();
  const [mutationBurden, setMutationBurden] = useState();

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const [imagesResp, comparatorsResp, mutationBurdenResp] = await Promise.all([
          ImageService.mutationBurden(report.ident),
          getComparators(report.ident),
          getMutationBurden(report.ident),
        ])
        setImages(processImages(imagesResp));
        setComparators(comparatorsResp);
        setMutationBurden(mutationBurdenResp);
      };

      getData();
    }
  }, [report]);

  const getImage = useCallback((image, role) => {
    let returnImage = {
      title: '',
      format: 'PNG',
      data: '',
      caption: '',
    };
    image.forEach(img => {
      const imgRole = img.key.split('.')[2] || '';
      if (role.toLowerCase() === imgRole.toLowerCase()) {
        returnImage = img;
      }
    });
    return returnImage;
  }, []);

  return (
    <div className="mutation-burden">
      <Typography variant="h3">
        Mutation Burden
      </Typography>
      {comparators && mutationBurden && images ? (
        <div className="mutation-burden__content">
          {comparators
            .filter(({ analysisRole }) => analysisRole.includes('mutation burden'))
            .map(({ analysisRole, name }) => {
              const mutationBurdenRole = mutationBurden.find(({ role }) => analysisRole.includes(role));

              if (!mutationBurdenRole) {
                return null;
              }

              const indelBarplot = getImage(images.indel.barplot, mutationBurdenRole.role);
              const indelDensity = getImage(images.indel.density, mutationBurdenRole.role);
              const indelLegend = getImage(images.indel.legend, mutationBurdenRole.role);
              const svBarplot = getImage(images.sv.barplot, mutationBurdenRole.role);
              const svDensity = getImage(images.sv.density, mutationBurdenRole.role);
              const svLegend = getImage(images.sv.legend, mutationBurdenRole.role);
              const snvBarplot = getImage(images.snv.barplot, mutationBurdenRole.role);
              const snvDensity = getImage(images.snv.density, mutationBurdenRole.role);
              const snvLegend = getImage(images.snv.legend, mutationBurdenRole.role);

              return (
                <React.Fragment key={analysisRole}>
                  <div className="mutation-burden__comparator">
                    <Typography variant="h3">
                      {`Comparator: ${name || 'none'}`}
                    </Typography>
                    <Typography variant="body2" className="mutation-burden__comparator--padded">
                      {`Role: ${mutationBurdenRole.role || 'none'}`}
                    </Typography>
                  </div>
                  <div className="mutation-burden__images">
                    {(indelBarplot.data || indelDensity.data || indelLegend.data || mutationBurdenRole) && (
                      <Card elevation={3} className="mutation-burden__group">
                        {indelBarplot.data && (
                          <span className="mutation-burden__image">
                            <Image
                              image={indelBarplot}
                              showTitle
                              showCaption
                            />
                          </span>
                        )}
                        {indelDensity.data && indelLegend.data && (
                          <span className="mutation-burden__pair">
                            <Typography>{indelDensity.title}</Typography>
                            <Image image={indelDensity} />
                            <Image image={indelLegend} />
                            <Typography>{indelDensity.caption}</Typography>
                          </span>
                        )}
                        {mutationBurdenRole && (
                          <CardContent>
                            <Typography variant="body2" className="mutation-burden__comparator--padded">
                              <>
                                Protein Coding Indels (count): 
                                {` ${mutationBurdenRole.codingIndelsCount}`}
                              </>
                            </Typography>
                            <Typography variant="body2" className="mutation-burden__comparator--padded">
                              <>
                                Protein Coding Indels (percentile): 
                                {` ${mutationBurdenRole.codingIndelPercentile}`}
                              </>
                            </Typography>
                            <Typography variant="body2" className="mutation-burden__comparator--padded">
                              <>
                                Frameshifting Protein Coding Indels (count):
                                {` ${mutationBurdenRole.frameshiftIndelsCount}`}
                              </>
                            </Typography>
                          </CardContent>
                        )}
                      </Card>
                    )}
                    {(svBarplot.data || svDensity.data || svLegend.data || mutationBurdenRole) && (
                      <Card elevation={3} className="mutation-burden__group">
                        {svBarplot.data && (
                          <span className="mutation-burden__image">
                            <Image
                              image={svBarplot}
                              showTitle
                              showCaption
                            />
                          </span>
                        )}
                        {svDensity.data && svLegend.data && (
                          <span className="mutation-burden__pair">
                            <Typography>{svDensity.title}</Typography>
                            <Image image={svDensity} />
                            <Image image={svLegend} />
                            <Typography>{svDensity.caption}</Typography>
                          </span>
                        )}
                        {mutationBurdenRole && (
                          <CardContent>
                            <Typography variant="body2" className="mutation-burden__comparator--padded">
                              <>
                                Structural Variants (count): 
                                {` ${mutationBurdenRole.qualitySvCount}`}
                              </>
                            </Typography>
                            <Typography variant="body2" className="mutation-burden__comparator--padded">
                              <>
                                Structural Variants (percentile): 
                                {` ${mutationBurdenRole.qualitySvPercentile}`}
                              </>
                            </Typography>
                            <Typography variant="body2" className="mutation-burden__comparator--padded">
                              <>
                                Expressed Structural Variants (count):
                                {` ${mutationBurdenRole.qualitySvExpressedCount}`}
                              </>
                            </Typography>
                          </CardContent>
                        )}
                      </Card>
                    )}
                    {(snvBarplot.data || snvDensity.data || snvLegend.data || mutationBurdenRole) && (
                      <Card elevation={3} className="mutation-burden__group">
                        {snvBarplot.data && (
                          <span className="mutation-burden__image">
                            <Image
                              image={snvBarplot}
                              showTitle
                              showCaption
                            />
                          </span>
                        )}
                        {snvDensity.data && snvLegend.data && (
                          <span className="mutation-burden__pair">
                            <Typography>{snvDensity.title}</Typography>
                            <Image image={snvDensity} />
                            <Image image={snvLegend} />
                            <Typography>{snvDensity.caption}</Typography>
                          </span>
                        )}
                        {mutationBurdenRole && (
                          <CardContent>
                            <Typography variant="body2" className="mutation-burden__comparator--padded">
                              <>
                                Protein Coding SNVs (count):
                                {` ${mutationBurdenRole.codingSnvCount}`}
                              </>
                            </Typography>
                            <Typography variant="body2" className="mutation-burden__comparator--padded">
                              <>
                                Protein Coding SNVs (percentile):
                                {` ${mutationBurdenRole.codingSnvPercentile}`}
                              </>
                            </Typography>
                            <Typography variant="body2" className="mutation-burden__comparator--padded">
                              <>
                                Truncating Protein Coding SNVs (count):
                                {` ${mutationBurdenRole.truncatingSnvCount}`}
                              </>
                            </Typography>
                          </CardContent>
                        )}
                      </Card>
                    )}
                  </div>
                </React.Fragment>
              );
          })}
        </div>
      ) : <LinearProgress />}
    </div>
  );
};

export default MutationBurden;
