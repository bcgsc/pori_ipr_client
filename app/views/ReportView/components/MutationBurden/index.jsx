import React, { useEffect, useState, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { Typography, LinearProgress } from '@material-ui/core';
import ReportContext from '../ReportContext';
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
          ImageService.mutationSummary(report.ident),
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

  const getImage = useCallback((image, comparator) => {
    let returnImage = {
      title: '',
      format: 'PNG',
      data: '',
      caption: '',
    };
    image.forEach(img => {
      const imgComparator = img.key.split('.')[2] || '';
      if (comparator.toLowerCase() === imgComparator.toLowerCase()) {
        returnImage = img;
      }
    });
    return returnImage;
  }, []);

  return (
    <div className="mutation-burden">
      <Typography variant="h1">
        Mutation Burden
      </Typography>
      {comparators && mutationBurden && images ? (
        <div className="mutation-burden__content">
          {comparators
            .filter(({ analysisRole }) => analysisRole.includes('mutation burden'))
            .map(({ analysisRole, name }) => {
              const mutationBurdenRole = mutationBurden.find(({ role }) => analysisRole.includes(role));

              return (
                <React.Fragment key={analysisRole}>
                  <div className="mutation-burden__comparator">
                    <Typography variant="h3">
                      {`Comparator: ${name || 'none'}`}
                    </Typography>
                    <Typography variant="body2" className="mutation-burden__comparator--padded">
                      {`Role: ${analysisRole || 'none'}`}
                    </Typography>
                    {mutationBurdenRole && (
                      <>
                        <Typography variant="body2" className="mutation-burden__comparator--padded">
                          <>
                            Number of non synonymous protein coding SNVs (Truncating):
                            {` ${mutationBurdenRole.snvTruncating}`}
                          </>
                        </Typography>
                        <Typography variant="body2" className="mutation-burden__comparator--padded">
                          <>
                            Number of protein coding indels (Frameshift):
                            {` ${mutationBurdenRole.indelsFrameshift}`}
                          </>
                        </Typography>
                      </>
                    )}
                  </div>
                  <div className="mutation-burden__images">
                    <span className="mutation-burden__group">
                      {getImage(images.indel.barplot, name).data && (
                        <span className="mutation-burden__image">
                          <Image
                            image={getImage(images.indel.barplot, name)}
                            showTitle
                            showCaption
                          />
                        </span>
                      )}
                      {getImage(images.indel.density, name).data && getImage(images.indel.legend, name).data && (
                        <span className="mutation-burden__pair">
                          <Typography>{getImage(images.indel.density, name).title}</Typography>
                          <Image image={getImage(images.indel.density, name)} />
                          <Image image={getImage(images.indel.legend, name)} />
                          <Typography>{getImage(images.indel.density, name).caption}</Typography>
                        </span>
                      )}
                    </span>
                    <span className="mutation-burden__group">
                      {getImage(images.sv.barplot, name).data && (
                        <span className="mutation-burden__image">
                          <Image
                            image={getImage(images.sv.barplot, name)}
                            showTitle
                            showCaption
                          />
                        </span>
                      )}
                      {getImage(images.sv.density, name).data && getImage(images.sv.legend, name).data && (
                        <span className="mutation-burden__pair">
                          <Typography>{getImage(images.sv.density, name).title}</Typography>
                          <Image image={getImage(images.sv.density, name)} />
                          <Image image={getImage(images.sv.legend, name)} />
                          <Typography>{getImage(images.sv.density, name).caption}</Typography>
                        </span>
                      )}
                    </span>
                    <span className="mutation-burden__group">
                      {getImage(images.snv.barplot, name).data && (
                        <span className="mutation-burden__image">
                          <Image
                            image={getImage(images.snv.barplot, name)}
                            showTitle
                            showCaption
                          />
                        </span>
                      )}
                      {getImage(images.snv.density, name).data && getImage(images.snv.legend, name).data && (
                        <span className="mutation-burden__pair">
                          <Typography>{getImage(images.snv.density, name).title}</Typography>
                          <Image image={getImage(images.snv.density, name)} />
                          <Image image={getImage(images.snv.legend, name)} />
                          <Typography>{getImage(images.snv.density, name).caption}</Typography>
                        </span>
                      )}
                    </span>
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
