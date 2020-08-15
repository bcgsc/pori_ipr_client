import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Typography, LinearProgress } from '@material-ui/core';
import ImageService from '@/services/reports/image.service';
import Image from './components/Image';

import './index.scss';

const processImages = (images) => {
  if (images) {
    const keyedImages = {
      comparators: [],
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
      const comparator = key.split('.')[2] || '';

      if (!keyedImages.comparators.includes(comparator)) {
        keyedImages.comparators.push(comparator.toLowerCase());
      }

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

const MutationBurden = (props) => {
  const {
    report,
  } = props;

  const [images, setImages] = useState();

  useEffect(() => {
    if (report) {
      const getData = async () => {
        const imagesResp = await ImageService.mutationSummary(report.ident);
        setImages(processImages(imagesResp));
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
      {images ? (
        <div className="mutation-burden__content">
          {images.comparators.map(comparator => (
            <React.Fragment key={comparator}>
              <Typography variant="h3" className="mutation-burden__comparator">
                {`Comparator: ${comparator || 'none'}`}
              </Typography>
              <div className="mutation-burden__images">
                <span className="mutation-burden__group">
                  {getImage(images.indel.barplot, comparator).data && (
                    <span className="mutation-burden__image">
                      <Image
                        image={getImage(images.indel.barplot, comparator)}
                        showTitle
                        showCaption
                      />
                    </span>
                  )}
                  {getImage(images.indel.density, comparator).data && getImage(images.indel.legend, comparator).data && (
                    <span className="mutation-burden__pair">
                      <Typography>{getImage(images.indel.density, comparator).title}</Typography>
                      <Image image={getImage(images.indel.density, comparator)} />
                      <Image image={getImage(images.indel.legend, comparator)} />
                      <Typography>{getImage(images.indel.density, comparator).caption}</Typography>
                    </span>
                  )}
                </span>
                <span className="mutation-burden__group">
                  {getImage(images.sv.barplot, comparator).data && (
                    <span className="mutation-burden__image">
                      <Image
                        image={getImage(images.sv.barplot, comparator)}
                        showTitle
                        showCaption
                      />
                    </span>
                  )}
                  {getImage(images.sv.density, comparator).data && getImage(images.sv.legend, comparator).data && (
                    <span className="mutation-burden__pair">
                      <Typography>{getImage(images.sv.density, comparator).title}</Typography>
                      <Image image={getImage(images.sv.density, comparator)} />
                      <Image image={getImage(images.sv.legend, comparator)} />
                      <Typography>{getImage(images.sv.density, comparator).caption}</Typography>
                    </span>
                  )}
                </span>
                <span className="mutation-burden__group">
                  {getImage(images.snv.barplot, comparator).data && (
                    <span className="mutation-burden__image">
                      <Image
                        image={getImage(images.snv.barplot, comparator)}
                        showTitle
                        showCaption
                      />
                    </span>
                  )}
                  {getImage(images.snv.density, comparator).data && getImage(images.snv.legend, comparator).data && (
                    <span className="mutation-burden__pair">
                      <Typography>{getImage(images.snv.density, comparator).title}</Typography>
                      <Image image={getImage(images.snv.density, comparator)} />
                      <Image image={getImage(images.snv.legend, comparator)} />
                      <Typography>{getImage(images.snv.density, comparator).caption}</Typography>
                    </span>
                  )}
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
      ) : <LinearProgress />}
    </div>
  );
};

MutationBurden.PropTypes = {
  report: PropTypes.object.isRequired,
};

export default MutationBurden;
