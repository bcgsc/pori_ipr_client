import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, LinearProgress } from '@material-ui/core';
import ImageService from '@/services/reports/image.service';

import './index.scss';

const processImages = (images) => {
  if (images) {
    const keyedImages = {
      barplotIndel: {},
      barplotSnv: {},
      barplotSv: {},
      densityIndel: {},
      densitySnv: {},
      densitySv: {},
      legendSnvIndel: {},
      legendSv: {},
    };

    Object.values(images).forEach((image) => {
      const key = image.key.toLowerCase();

      if (key.includes('barplot')) {
        if (key.includes('indel')) {
          keyedImages.barplotIndel = image;
        }

        if (key.includes('snv')) {
          keyedImages.barplotSnv = image;
        }

        if (key.includes('sv')) {
          keyedImages.barplotSv = image;
        }
      }

      if (key.includes('density')) {
        if (key.includes('indel')) {
          keyedImages.densityIndel = image;
        }

        if (key.includes('snv')) {
          keyedImages.densitySnv = image;
        }

        if (key.includes('sv')) {
          keyedImages.densitySv = image;
        }
      }

      if (key.includes('legend')) {
        if (key.includes('indel') || key.includes('snv')) {
          keyedImages.legendSnvIndel = image;
        }

        if (key.includes('sv')) {
          keyedImages.legendSv = image;
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

  return (
    <div className="mutation-burden">
      <Typography variant="h1">
        Mutation Burden
      </Typography>
      {images ? (
        <div className="mutation-burden__content">
          <Typography variant="h3">
            INDELs
          </Typography>
          <div className="mutation-burden__images">
            <img
              src={`data:image/${images.barplotIndel.format};base64,${images.barplotIndel.data}`}
              alt={images.barplotIndel.caption}
            />
            <div className="mutation-burden__pair">
              <img
                src={`data:image/${images.densityIndel.format};base64,${images.densityIndel.data}`}
                alt={images.densityIndel.caption}
              />
              <img
                src={`data:image/${images.legendSnvIndel.format};base64,${images.legendSnvIndel.data}`}
                alt={images.legendSnvIndel.caption}
              />
            </div>
          </div>
          <Typography variant="h3">
            SVs
          </Typography>
          <div className="mutation-burden__images">
            <img
              src={`data:image/${images.barplotSv.format};base64,${images.barplotSv.data}`}
              alt={images.barplotSv.caption}
            />
            <div className="mutation-burden__pair">
              <img
                src={`data:image/${images.densitySv.format};base64,${images.densitySv.data}`}
                alt={images.densitySv.caption}
              />
              <img
                src={`data:image/${images.legendSv.format};base64,${images.legendSv.data}`}
                alt={images.legendSv.caption}
              />
            </div>
          </div>
          <Typography variant="h3">
            SNVs
          </Typography>
          <div className="mutation-burden__images">
            <img
              src={`data:image/${images.barplotSnv.format};base64,${images.barplotSnv.data}`}
              alt={images.barplotSnv.caption}
            />
            <div className="mutation-burden__pair">
              <img
                src={`data:image/${images.densitySnv.format};base64,${images.densitySnv.data}`}
                alt={images.densitySnv.caption}
              />
              <img
                src={`data:image/${images.legendSnvIndel.format};base64,${images.legendSnvIndel.data}`}
                alt={images.legendSnvIndel.caption}
              />
            </div>
          </div>
        </div>
      ) : <LinearProgress />}
    </div>
  );
};

MutationBurden.PropTypes = {
  report: PropTypes.object.isRequired,
};

export default MutationBurden;
